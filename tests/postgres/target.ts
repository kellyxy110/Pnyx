export function verificationTarget(env: Record<string, string | undefined>) {
  if (env.PNYX_DISPOSABLE_POSTGRES !== "1") throw new Error("Disposable PostgreSQL verification requires explicit opt-in.");
  const database = new URL(env.DATABASE_URL ?? "");
  const app = new URL(env.APP_URL ?? "http://127.0.0.1:3000");
  const loopback = new Set(["127.0.0.1", "localhost", "[::1]"]);
  if (!loopback.has(database.hostname) || !["postgres:", "postgresql:"].includes(database.protocol)) {
    throw new Error("Verification database must use PostgreSQL on loopback.");
  }
  if (!/^\/pnyx_verify_[a-z0-9_]+$/.test(database.pathname)) throw new Error("Database name must start with pnyx_verify_.");
  if ([...database.searchParams.keys()].some(key => !["schema", "connection_limit"].includes(key))) {
    throw new Error("Only schema and connection_limit are permitted for native verification.");
  }
  if (database.searchParams.has("schema") && database.searchParams.get("schema") !== "public") {
    throw new Error("Verification requires the disposable database's public schema.");
  }
  if (!loopback.has(app.hostname) || app.protocol !== "http:" || app.username || app.password || app.pathname !== "/" || app.search || app.hash) {
    throw new Error("Verification app must use an HTTP loopback origin.");
  }
  return { database, app };
}
