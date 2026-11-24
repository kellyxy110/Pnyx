import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { cleanupAccess } from "./media-cleanup-access";
const secret = "synthetic-worker-secret-at-least-32-characters";
const request = (value = `Bearer ${secret}`) => new Request("http://localhost/api/internal/media-cleanup", { headers: { authorization: value } });
beforeEach(() => {
  vi.stubEnv("MEDIA_CLEANUP_ENABLED", "true"); vi.stubEnv("CRON_SECRET", secret);
  vi.stubEnv("R2_ENDPOINT", "https://fixture.r2.cloudflarestorage.com"); vi.stubEnv("R2_BUCKET_NAME", "pnyx-e2e-fixture");
  vi.stubEnv("R2_ACCESS_KEY_ID", "synthetic"); vi.stubEnv("R2_SECRET_ACCESS_KEY", "synthetic"); vi.stubEnv("R2_PUBLIC_BASE_URL", "https://media.example.test");
  vi.stubEnv("MEDIA_CLEANUP_ENDPOINT", "https://fixture.r2.cloudflarestorage.com"); vi.stubEnv("MEDIA_CLEANUP_BUCKET", "pnyx-e2e-fixture");
});
afterEach(() => vi.unstubAllEnvs());
it("requires explicit enablement", () => { vi.stubEnv("MEDIA_CLEANUP_ENABLED", "false"); expect(cleanupAccess(request()).status).toBe(404); });
it("fails closed without a sufficiently long secret", () => { vi.stubEnv("CRON_SECRET", "short"); expect(cleanupAccess(request()).status).toBe(503); });
it("rejects missing or incorrect bearer authorization", () => { expect(cleanupAccess(request("")).status).toBe(401); expect(cleanupAccess(request("Bearer wrong")).status).toBe(401); });
it("requires exact separately declared storage target", () => { vi.stubEnv("MEDIA_CLEANUP_BUCKET", "another"); expect(cleanupAccess(request()).status).toBe(503); });
it("requires actual complete storage configuration", () => { vi.stubEnv("R2_SECRET_ACCESS_KEY", ""); expect(cleanupAccess(request()).status).toBe(503); });
it("accepts only authorized enabled matching configuration", () => { expect(cleanupAccess(request())).toEqual({ status: 200, target: { endpoint: "https://fixture.r2.cloudflarestorage.com", bucket: "pnyx-e2e-fixture" } }); });
