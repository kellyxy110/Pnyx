import { spawn, type ChildProcess } from "node:child_process";
import { randomBytes, randomUUID } from "node:crypto";
import { verificationTarget } from "../tests/postgres/target";
import { authenticatedVerificationTarget } from "../src/lib/disposable-verification";

const { app } = verificationTarget(process.env);
if (process.argv.slice(2).some(flag => !["--browser", "--media"].includes(flag))) throw new Error("Unknown verification option.");
const browser = process.argv.includes("--browser");
const media = process.argv.includes("--media");
if (media && (!browser || process.env.E2E_STORAGE_ENABLED !== "true")) throw new Error("Media verification needs --browser and explicit storage opt-in.");
const browserId = `browser-${randomUUID()}`;
const fixturePassword = `Fixture-A1-${randomUUID()}`;
const env = {
  ...process.env,
  E2E_STORAGE_ENABLED: media ? "true" : "false",
  E2E_ALLOW_AUTHENTICATED: browser ? "true" : "false",
  E2E_EMAIL: browser ? `${browserId}@example.test` : "",
  E2E_PASSWORD: browser ? fixturePassword : "",
  PLAYWRIGHT_BASE_URL: app.origin,
  PNYX_PGLITE_UI: "",
  PNYX_VERIFICATION_SECRET: randomBytes(32).toString("hex"),
  AUTH_SECRET: randomUUID() + randomUUID(),
  APP_URL: app.origin,
  AUTH_URL: app.origin,
  NEXTAUTH_URL: app.origin,
  PNYX_FIXTURE_PASSWORD: fixturePassword,
  EMAIL_SIGNUP_ENABLED: "false",
  GOOGLE_CLIENT_ID: "", GOOGLE_CLIENT_SECRET: "", GITHUB_CLIENT_ID: "", GITHUB_CLIENT_SECRET: "",
  RESEND_API_KEY: "", GROQ_API_KEY: "",
  R2_ENDPOINT: media ? process.env.R2_ENDPOINT : "", R2_ACCESS_KEY_ID: media ? process.env.R2_ACCESS_KEY_ID : "",
  R2_SECRET_ACCESS_KEY: media ? process.env.R2_SECRET_ACCESS_KEY : "", R2_BUCKET_NAME: media ? process.env.R2_BUCKET_NAME : "",
  R2_PUBLIC_BASE_URL: media ? process.env.R2_PUBLIC_BASE_URL : "",
};

if (browser) authenticatedVerificationTarget(env);

async function command(args: string[]) {
  await new Promise<void>((resolve, reject) => {
    const child = spawn(process.execPath, ["node_modules/.bin/" + args[0], ...args.slice(1)], { env, stdio: "inherit" });
    child.once("error", reject);
    child.once("exit", code => code === 0 ? resolve() : reject(new Error(`${args[0]} failed with exit ${code}.`)));
  });
}

async function main() {
 let server: ChildProcess | undefined;
 let fixtureDb: import("@prisma/client").PrismaClient | undefined;
 let createdWebSpace = false;
 try {
  await command(["prisma", "migrate", "deploy"]);
  await command(["prisma", "migrate", "status"]);
  await command(["prisma", "migrate", "diff", "--from-schema-datasource", "prisma/schema.foundation.prisma", "--to-schema-datamodel", "prisma/schema.foundation.prisma", "--exit-code"]);
  await command(["prisma", "generate"]);
  await command(["next", "build"]);
  server = spawn(process.execPath, ["node_modules/.bin/next", "start", "--hostname", app.hostname, "--port", app.port || "3000"], { env, stdio: "inherit" });
  let ready = false;
  for (let attempt = 0; attempt < 120; attempt++) {
    if (server.exitCode !== null) throw new Error("Local verification server exited before becoming ready.");
    try { ready = (await fetch(app.origin, { signal: AbortSignal.timeout(1000) })).ok; } catch { /* Wait for local startup. */ }
    if (ready) break;
    await new Promise(resolve => setTimeout(resolve, 250));
  }
  if (!ready) throw new Error("Local verification server did not become ready.");
  await command(["playwright", "test", "--config", "playwright.postgres.config.ts"]);
  if (browser) {
    const { PrismaClient } = await import("@prisma/client");
    const bcrypt = await import("bcryptjs");
    fixtureDb = new PrismaClient();
    const web = await fixtureDb.space.findUnique({ where: { slug: "web" }, select: { name: true, isPublic: true } });
    if (web && (web.name !== "Web3" || !web.isPublic)) throw new Error("Existing disposable Web3 fixture does not match the browser contract.");
    if (!web) {
      await fixtureDb.space.create({ data: { id: `${browserId}-web`, slug: "web", name: "Web3", description: "Disposable browser verification Space" } });
      createdWebSpace = true;
    }
    await fixtureDb.user.create({ data: { id: browserId, username: `browser_${randomUUID().replaceAll("-", "").slice(0, 20)}`, email: env.E2E_EMAIL, displayName: "Disposable browser fixture", passwordHash: await bcrypt.hash(fixturePassword, 10), emailVerifiedAt: new Date() } });
    await command(["playwright", "test"]);
  }
 } finally {
  try {
    if (fixtureDb) {
      const fixture = await fixtureDb.user.findUnique({ where: { id: browserId }, select: { avatarKey: true, bannerKey: true } });
      if (fixture?.avatarKey || fixture?.bannerKey) throw new Error("Fixture media cleanup is incomplete; retain its database pointers for isolated reconciliation.");
      await fixtureDb.user.deleteMany({ where: { id: browserId } });
      if (createdWebSpace) await fixtureDb.space.deleteMany({ where: { id: `${browserId}-web` } });
    }
  } finally { await fixtureDb?.$disconnect(); server?.kill("SIGTERM"); }
 }
}

void main().catch(error => {
  console.error(error instanceof Error ? error.message : "Native PostgreSQL verification failed.");
  process.exitCode = 1;
});
