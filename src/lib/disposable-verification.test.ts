import { describe, expect, it } from "vitest";
import { authenticatedVerificationTarget, localVerificationProof, proofMatches, storageVerificationTarget, verificationProof, verificationTarget } from "./disposable-verification";

const env = { PNYX_DISPOSABLE_POSTGRES: "1", DATABASE_URL: "postgresql://fixture:fixture@127.0.0.1:5432/pnyx_verify_ci?connection_limit=1", APP_URL: "http://127.0.0.1:3000", PLAYWRIGHT_BASE_URL: "http://127.0.0.1:3000", E2E_ALLOW_AUTHENTICATED: "true", E2E_EMAIL: "fixture@example.test", E2E_PASSWORD: "Disposable-Password-A1!", PNYX_VERIFICATION_SECRET: "a".repeat(64) };
const media = { ...env, E2E_STORAGE_ENABLED: "true", R2_ENDPOINT: "https://fixture.r2.cloudflarestorage.com", R2_PUBLIC_BASE_URL: "https://media.example.test/fixture", R2_BUCKET_NAME: "pnyx-e2e-acceptance", R2_ACCESS_KEY_ID: "fixture-access", R2_SECRET_ACCESS_KEY: "fixture-secret", E2E_STORAGE_ENDPOINT: "https://fixture.r2.cloudflarestorage.com", E2E_STORAGE_BUCKET: "pnyx-e2e-acceptance", E2E_STORAGE_PUBLIC_BASE_URL: "https://media.example.test/fixture" };
const nonce = "c".repeat(64);

describe("positive authenticated target isolation", () => {
  it("skips unrequested authenticated tests and accepts complete local fixture configuration", () => {
    expect(authenticatedVerificationTarget({})).toBeNull();
    expect(authenticatedVerificationTarget(env)?.app.origin).toBe(env.APP_URL);
  });
  it.each(["https://pnyx-psi.vercel.app", "https://another-production-alias.vercel.app", "http://192.0.2.1:3000", "http://127.0.0.1:3000/other", "http://fixture@127.0.0.1:3000", "http://127.0.0.1:3000/?target=other"])("rejects unsafe app target %s", value => {
    expect(() => authenticatedVerificationTarget({ ...env, APP_URL: value, PLAYWRIGHT_BASE_URL: value })).toThrow();
  });
  it.each([
    { PNYX_DISPOSABLE_POSTGRES: "0" }, { VERCEL: "1" }, { VERCEL_ENV: "preview" },
    { DATABASE_URL: "postgresql://fixture:fixture@database.example.test/pnyx_verify_ci" },
    { DATABASE_URL: "postgresql://fixture:fixture@127.0.0.1/pnyx" },
    { DATABASE_URL: env.DATABASE_URL + "&host=remote.example.test" },
    { DATABASE_URL: env.DATABASE_URL + "&connection_limit=2" },
    { DATABASE_URL: env.DATABASE_URL + "&options=anything" },
    { DATABASE_URL: env.DATABASE_URL.replace("connection_limit=1", "connection_limit=100") },
    { PLAYWRIGHT_BASE_URL: "http://127.0.0.1:3001" }, { E2E_EMAIL: "real-user@example.com" },
    { E2E_PASSWORD: "short" }, { PNYX_VERIFICATION_SECRET: "" },
  ])("rejects missing or contradictory fixture configuration %#", patch => expect(() => authenticatedVerificationTarget({ ...env, ...patch })).toThrow());
  it("allows only explicitly opted-in PGlite options on the disposable UI database", () => {
    const pglite = { ...env, PNYX_PGLITE_UI: "1", DATABASE_URL: "postgresql://fixture:fixture@127.0.0.1:5439/pnyx_verify_ui?connection_limit=1&pgbouncer=true&statement_cache_size=0" };
    expect(authenticatedVerificationTarget(pglite)).not.toBeNull();
    expect(() => verificationTarget(pglite)).toThrow();
    expect(() => authenticatedVerificationTarget({ ...pglite, PNYX_PGLITE_UI: undefined })).toThrow();
    expect(() => authenticatedVerificationTarget({ ...pglite, DATABASE_URL: pglite.DATABASE_URL.replace("pnyx_verify_ui", "pnyx_ui") })).toThrow();
  });
  it("does not include malformed database credentials in diagnostics", () => {
    try { verificationTarget({ ...env, DATABASE_URL: "not-a-url-fixture-secret" }); } catch (error) { expect(String(error)).not.toContain("fixture-secret"); }
  });
});
describe("dedicated media verification target", () => {
  it("keeps storage disabled by default and accepts reviewed matching configuration", () => {
    expect(storageVerificationTarget(env)).toBeNull();
    expect(authenticatedVerificationTarget(media)?.storage?.bucket).toBe(media.R2_BUCKET_NAME);
  });
  it.each([
    { E2E_ALLOW_AUTHENTICATED: "false" }, { R2_BUCKET_NAME: "pnyx-production", E2E_STORAGE_BUCKET: "pnyx-production" },
    { E2E_STORAGE_BUCKET: "pnyx-e2e-other" }, { E2E_STORAGE_ENDPOINT: "https://other.r2.cloudflarestorage.com" },
    { E2E_STORAGE_PUBLIC_BASE_URL: "https://other.example.test" }, { R2_SECRET_ACCESS_KEY: "" },
    { R2_ENDPOINT: "http://fixture.r2.cloudflarestorage.com" }, { R2_ENDPOINT: "https://user:pass@fixture.r2.cloudflarestorage.com" },
    { R2_PUBLIC_BASE_URL: "https://media.example.test/?query=private" },
  ])("rejects missing, unsafe or mismatched media targets %#", patch => expect(() => authenticatedVerificationTarget({ ...media, ...patch })).toThrow());
});
describe("application challenge proof", () => {
  it("accepts only the expected per-run nonce-bound proof", () => {
    const proof = verificationProof(env, nonce);
    expect(proofMatches(proof, localVerificationProof(env, nonce))).toBe(true);
    expect(proofMatches(proof, verificationProof(env, "d".repeat(64)))).toBe(false);
    expect(proofMatches(proof, "wrong length")).toBe(false);
    expect(proofMatches(proof, null)).toBe(false);
  });
  it("binds the application database, fixture identity, storage and run secret", () => {
    const proof = verificationProof(media, nonce);
    for (const patch of [{ DATABASE_URL: media.DATABASE_URL.replace("pnyx_verify_ci", "pnyx_verify_other") }, { E2E_EMAIL: "other@example.test" }, { R2_ACCESS_KEY_ID: "other-access" }, { R2_SECRET_ACCESS_KEY: "other-secret" }, { PNYX_VERIFICATION_SECRET: "b".repeat(64) }]) expect(proofMatches(proof, verificationProof({ ...media, ...patch }, nonce))).toBe(false);
  });
  it("provides no proof for ordinary deployment settings, missing opt-in or malformed challenges", () => {
    for (const patch of [{ PNYX_DISPOSABLE_POSTGRES: undefined }, { VERCEL: "1" }, { PNYX_VERIFICATION_SECRET: undefined }, { DATABASE_URL: env.DATABASE_URL.replace("pnyx_verify_ci", "pnyx") }]) expect(localVerificationProof({ ...env, ...patch }, nonce)).toBeNull();
    expect(localVerificationProof(env, null)).toBeNull();
    expect(localVerificationProof(env, "malformed")).toBeNull();
  });
});
