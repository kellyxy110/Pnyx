import { describe, expect, it } from "vitest";
import { verificationTarget } from "../../tests/postgres/target";

const env = { PNYX_DISPOSABLE_POSTGRES: "1", DATABASE_URL: "postgresql://fixture:fixture@127.0.0.1:5432/pnyx_verify_ci", APP_URL: "http://127.0.0.1:3000" };
describe("disposable PostgreSQL verification target", () => {
  it("accepts explicitly opted-in disposable loopback targets", () => {
    expect(verificationTarget(env).database.pathname).toBe("/pnyx_verify_ci");
  });
  it("refuses missing opt-in", () => expect(() => verificationTarget({ ...env, PNYX_DISPOSABLE_POSTGRES: undefined })).toThrow());
  it("refuses remote databases", () => expect(() => verificationTarget({ ...env, DATABASE_URL: env.DATABASE_URL.replace("127.0.0.1", "database.example.com") })).toThrow());
  it("refuses ordinary project databases", () => expect(() => verificationTarget({ ...env, DATABASE_URL: env.DATABASE_URL.replace("pnyx_verify_ci", "pnyx") })).toThrow());
  it("refuses connection redirection and pooler overrides", () => {
    for (const suffix of ["?host=remote.example.com", "?pgbouncer=true", "?schema=production", "?statement_cache_size=0"]) {
      expect(() => verificationTarget({ ...env, DATABASE_URL: env.DATABASE_URL + suffix })).toThrow();
    }
  });
  it("refuses remote app origins", () => expect(() => verificationTarget({ ...env, APP_URL: "https://pnyx-psi.vercel.app" })).toThrow());
});
