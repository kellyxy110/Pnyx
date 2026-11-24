import { beforeEach, describe, expect, it, vi } from "vitest";
import { verificationProof } from "../../../lib/disposable-verification";
const mocks = vi.hoisted(() => ({ checkHealth: vi.fn() }));
vi.mock("@/lib/health", () => mocks);
vi.mock("@/lib/disposable-verification", () => import("../../../lib/disposable-verification"));
import { GET } from "./route";
const nonce = "c".repeat(64);
const keys = ["PNYX_DISPOSABLE_POSTGRES", "PNYX_VERIFICATION_SECRET", "DATABASE_URL", "APP_URL", "VERCEL", "VERCEL_ENV", "E2E_STORAGE_ENABLED", "E2E_EMAIL", "R2_ENDPOINT", "R2_BUCKET_NAME", "R2_PUBLIC_BASE_URL", "R2_ACCESS_KEY_ID", "R2_SECRET_ACCESS_KEY"];
import { afterEach } from "vitest";
afterEach(() => vi.unstubAllEnvs());
beforeEach(() => { for (const key of keys) vi.stubEnv(key, ""); mocks.checkHealth.mockResolvedValue({ status: "ok", service: "pnyx", database: "ok", timestamp: "fixture" }); });
const request = () => new Request("http://127.0.0.1:3000/api/health", { headers: { "X-Pnyx-Verification-Nonce": nonce } });
describe("health verification proof boundary", () => {
 it("does not expose proof or configuration in ordinary deployments", async () => {
  const response = await GET(request()); expect(response.status).toBe(200); expect(response.headers.has("x-pnyx-verification-proof")).toBe(false); expect(await response.json()).toEqual({ status: "ok", service: "pnyx", database: "ok", timestamp: "fixture" });
 });
 it("returns a matching proof only for healthy explicitly disposable targets", async () => {
  vi.stubEnv("PNYX_DISPOSABLE_POSTGRES", "1"); vi.stubEnv("PNYX_VERIFICATION_SECRET", "a".repeat(64)); vi.stubEnv("DATABASE_URL", "postgresql://fixture:fixture@127.0.0.1/pnyx_verify_health"); vi.stubEnv("APP_URL", "http://127.0.0.1:3000");
  const expected = verificationProof(process.env, nonce); const response = await GET(request()); expect(response.headers.get("x-pnyx-verification-proof")).toBe(expected); expect(response.headers.get("cache-control")).toBe("no-store"); expect(JSON.stringify(await response.json())).not.toContain("pnyx_verify_health");
  mocks.checkHealth.mockResolvedValueOnce({ status: "degraded", database: "error" }); const degraded = await GET(request()); expect(degraded.status).toBe(503); expect(degraded.headers.has("x-pnyx-verification-proof")).toBe(false);
 });
});
