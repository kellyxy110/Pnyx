import { spawn, type ChildProcess } from "node:child_process";
import { randomUUID } from "node:crypto";
import { verificationTarget } from "../tests/postgres/target";

const { app } = verificationTarget(process.env);
const env = {
  ...process.env,
  AUTH_SECRET: randomUUID() + randomUUID(),
  APP_URL: app.origin,
  PNYX_FIXTURE_PASSWORD: `Fixture-A1-${randomUUID()}`,
  EMAIL_SIGNUP_ENABLED: "false",
  GOOGLE_CLIENT_ID: "", GOOGLE_CLIENT_SECRET: "", GITHUB_CLIENT_ID: "", GITHUB_CLIENT_SECRET: "",
  RESEND_API_KEY: "", GROQ_API_KEY: "", R2_ENDPOINT: "", R2_ACCESS_KEY_ID: "", R2_SECRET_ACCESS_KEY: "", R2_BUCKET_NAME: "", R2_PUBLIC_BASE_URL: "",
};

async function command(args: string[]) {
  await new Promise<void>((resolve, reject) => {
    const child = spawn(process.execPath, ["node_modules/.bin/" + args[0], ...args.slice(1)], { env, stdio: "inherit" });
    child.once("error", reject);
    child.once("exit", code => code === 0 ? resolve() : reject(new Error(`${args[0]} failed with exit ${code}.`)));
  });
}

async function main() {
 let server: ChildProcess | undefined;
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
 } finally { server?.kill("SIGTERM"); }
}

void main().catch(error => {
  console.error(error instanceof Error ? error.message : "Native PostgreSQL verification failed.");
  process.exitCode = 1;
});
