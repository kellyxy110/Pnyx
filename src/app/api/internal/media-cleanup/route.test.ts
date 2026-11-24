import { beforeEach, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ access: vi.fn(), run: vi.fn(), status: vi.fn() }));
vi.mock("@/lib/media-cleanup-access", () => ({ cleanupAccess: mocks.access }));
vi.mock("@/lib/media-cleanup-worker", () => ({ runMediaCleanupBatch: mocks.run, cleanupWorkerStatus: mocks.status }));
import { GET, POST } from "./route";
import { GET as statusGET } from "./status/route";
const request = new Request("http://localhost/api/internal/media-cleanup");
beforeEach(() => { vi.resetAllMocks(); mocks.access.mockReturnValue({ status: 200, target: { endpoint: "synthetic", bucket: "synthetic" } }); mocks.run.mockResolvedValue({ state: "ok" }); mocks.status.mockResolvedValue({ state: "ok" }); });
it("never invokes storage/database worker for disabled or unauthorized requests", async () => {
  for (const code of [404, 401, 503]) { mocks.access.mockReturnValue({ status: code }); expect((await GET(request)).status).toBe(code); expect((await statusGET(request)).status).toBe(code); }
  expect(mocks.run).not.toHaveBeenCalled(); expect(mocks.status).not.toHaveBeenCalled();
});
it("supports scheduled GET and POST with no-store responses", async () => { expect((await GET(request)).status).toBe(200); const result = await POST(request); expect(result.status).toBe(200); expect(result.headers.get("cache-control")).toBe("no-store"); expect(mocks.run).toHaveBeenCalledTimes(2); });
it("reports overlap and actionable failures with non-success status", async () => { mocks.run.mockResolvedValue({ state: "busy" }); expect((await GET(request)).status).toBe(409); mocks.run.mockResolvedValue({ state: "attention" }); expect((await GET(request)).status).toBe(503); });
it("returns a sanitized failure response", async () => { mocks.run.mockRejectedValue(new Error("sensitive-provider-detail")); const response = await GET(request); expect(response.status).toBe(503); expect(await response.text()).not.toContain("sensitive-provider-detail"); });
it("status reports stale or failing recovery without running cleanup", async () => { mocks.status.mockResolvedValue({ state: "attention", stale: true }); expect((await statusGET(request)).status).toBe(503); expect(mocks.run).not.toHaveBeenCalled(); });
it("status returns unavailable on database failure", async () => { mocks.status.mockRejectedValue(new Error("private database detail")); const response = await statusGET(request); expect(response.status).toBe(503); expect(await response.text()).not.toContain("private database detail"); });
