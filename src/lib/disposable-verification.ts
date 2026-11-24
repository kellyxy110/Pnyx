import { createHmac, timingSafeEqual } from "node:crypto";

type Environment = Record<string, string | undefined>;
const loopback = new Set(["127.0.0.1", "localhost", "[::1]"]);
function url(value: string | undefined) {
  try { return new URL(value ?? ""); } catch { throw new Error("Verification URL configuration is invalid."); }
}
function localApp(value: string | undefined) {
  const app = url(value);
  if (!loopback.has(app.hostname) || app.protocol !== "http:" || app.username || app.password || app.pathname !== "/" || app.search || app.hash) throw new Error("Verification app must be an HTTP loopback origin.");
  return app;
}
export function verificationTarget(env: Environment, allowPglite = false) {
  if (env.PNYX_DISPOSABLE_POSTGRES !== "1" || env.VERCEL || env.VERCEL_ENV) throw new Error("Verification requires explicit disposable local configuration.");
  const database = url(env.DATABASE_URL);
  const app = localApp(env.APP_URL);
  if (!loopback.has(database.hostname) || !["postgres:", "postgresql:"].includes(database.protocol) || !/^\/pnyx_verify_[a-z0-9_]+$/.test(database.pathname)) throw new Error("Verification requires a named disposable PostgreSQL database on loopback.");
  const pglite = allowPglite && env.PNYX_PGLITE_UI === "1" && database.pathname === "/pnyx_verify_ui";
  const permitted = new Set(["schema", "connection_limit", ...(pglite ? ["pgbouncer", "statement_cache_size"] : [])]);
  for (const key of database.searchParams.keys()) {
    if (!permitted.has(key) || database.searchParams.getAll(key).length !== 1) throw new Error("Verification database options are not permitted.");
  }
  const options = database.searchParams;
  if ((options.has("schema") && options.get("schema") !== "public") || (options.has("connection_limit") && !/^(?:[1-9]|10)$/.test(options.get("connection_limit")!)) || (options.has("pgbouncer") && options.get("pgbouncer") !== "true") || (options.has("statement_cache_size") && options.get("statement_cache_size") !== "0")) throw new Error("Verification database option values are invalid.");
  return { database, app };
}
export function verificationSecret(env: Environment) {
  if (!/^[a-f0-9]{64}$/.test(env.PNYX_VERIFICATION_SECRET ?? "")) throw new Error("Verification requires a fresh per-run secret.");
  return env.PNYX_VERIFICATION_SECRET!;
}
export function storageVerificationTarget(env: Environment) {
  if (env.E2E_STORAGE_ENABLED !== "true") return null;
  if (env.E2E_ALLOW_AUTHENTICATED !== "true") throw new Error("Storage verification requires authenticated fixture opt-in.");
  verificationTarget(env, true);
  const endpoint = url(env.R2_ENDPOINT);
  const publicBase = url(env.R2_PUBLIC_BASE_URL);
  if (endpoint.protocol !== "https:" || !/^[a-z0-9]+\.r2\.cloudflarestorage\.com$/.test(endpoint.hostname) || endpoint.username || endpoint.password || endpoint.pathname !== "/" || endpoint.search || endpoint.hash || endpoint.port) throw new Error("Storage verification requires a reviewed R2 endpoint.");
  if (publicBase.protocol !== "https:" || publicBase.username || publicBase.password || publicBase.search || publicBase.hash || publicBase.port || loopback.has(publicBase.hostname)) throw new Error("Storage verification requires a reviewed HTTPS delivery base.");
  if (!/^pnyx-e2e-[a-z0-9-]{1,40}$/.test(env.R2_BUCKET_NAME ?? "") || env.E2E_STORAGE_BUCKET !== env.R2_BUCKET_NAME || env.E2E_STORAGE_ENDPOINT !== endpoint.origin || env.E2E_STORAGE_PUBLIC_BASE_URL !== publicBase.href.replace(/\/$/, "") || !env.R2_ACCESS_KEY_ID || !env.R2_SECRET_ACCESS_KEY) throw new Error("Storage verification requires matching dedicated test-bucket configuration.");
  return { endpoint: endpoint.origin, bucket: env.R2_BUCKET_NAME!, publicBase: publicBase.href.replace(/\/$/, "") };
}
export function authenticatedVerificationTarget(env: Environment) {
  if (env.E2E_ALLOW_AUTHENTICATED !== "true") {
    if (env.E2E_STORAGE_ENABLED === "true") throw new Error("Storage verification cannot run without authenticated fixtures.");
    return null;
  }
  const target = verificationTarget(env, true);
  if (localApp(env.PLAYWRIGHT_BASE_URL).origin !== target.app.origin) throw new Error("Browser and application verification origins must match.");
  if (!/^[^@\s]{1,100}@[a-z0-9.-]+\.(?:test|invalid)$/i.test(env.E2E_EMAIL ?? "") || (env.E2E_PASSWORD?.length ?? 0) < 12) throw new Error("Verification requires a dedicated synthetic account.");
  verificationSecret(env);
  const storage = storageVerificationTarget(env);
  return { ...target, storage };
}
/** No values or configuration are returned publicly; the proof binds a fresh nonce to this process's test target. */
export function verificationProof(env: Environment, nonce: string) {
  const target = verificationTarget(env, true);
  const secret = verificationSecret(env);
  if (!/^[a-f0-9]{64}$/.test(nonce)) throw new Error("Verification nonce is invalid.");
  const storage = storageVerificationTarget(env);
  const payload = JSON.stringify(["pnyx-local-verification-v1", nonce, target.app.origin, target.database.href, env.E2E_EMAIL ?? "", storage, env.R2_ENDPOINT ?? "", env.R2_BUCKET_NAME ?? "", env.R2_PUBLIC_BASE_URL ?? "", env.R2_ACCESS_KEY_ID ?? "", env.R2_SECRET_ACCESS_KEY ?? ""]);
  return createHmac("sha256", secret).update(payload).digest("hex");
}
export function localVerificationProof(env: Environment, nonce: string | null) {
  try { return nonce ? verificationProof(env, nonce) : null; } catch { return null; }
}
export function proofMatches(expected: string, actual: string | null) {
  return Boolean(actual && /^[a-f0-9]{64}$/.test(actual) && timingSafeEqual(Buffer.from(expected, "hex"), Buffer.from(actual, "hex")));
}
