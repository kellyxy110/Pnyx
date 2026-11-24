import { beforeEach, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ auth: vi.fn(), signOut: vi.fn(), remove: vi.fn(), cleanup: vi.fn() }));
vi.mock("@/auth", () => ({ auth: mocks.auth, signOut: mocks.signOut }));
vi.mock("@/lib/delete-account", () => ({ deleteAccountWithMedia: mocks.remove }));
vi.mock("@/lib/media-cleanup", () => ({ attemptMediaCleanup: mocks.cleanup }));
import { DELETE } from "./route";
const req = (confirmation = "DELETE MY ACCOUNT") => new Request("http://localhost/api/account/delete", { method: "DELETE", body: JSON.stringify({ confirmation }) });
beforeEach(() => { vi.resetAllMocks(); mocks.auth.mockResolvedValue({ user: { id: "fixture" } }); mocks.remove.mockResolvedValue(["receipt-a", "receipt-b"]); mocks.cleanup.mockResolvedValue(true); });
it("requires a session and exact confirmation before deleting", async () => {
  mocks.auth.mockResolvedValue(null); expect((await DELETE(req())).status).toBe(401);
  mocks.auth.mockResolvedValue({ user: { id: "fixture" } }); expect((await DELETE(req("wrong"))).status).toBe(400); expect(mocks.remove).not.toHaveBeenCalled();
});
it("keeps the session and reports failure if transactional deletion cannot complete", async () => {
  mocks.remove.mockRejectedValue(new Error("Synthetic database failure")); expect((await DELETE(req())).status).toBe(503); expect(mocks.signOut).not.toHaveBeenCalled(); expect(mocks.cleanup).not.toHaveBeenCalled();
});
it("reports pending file cleanup honestly after account deletion", async () => {
  mocks.cleanup.mockResolvedValue(false); const response = await DELETE(req()); expect(response.status).toBe(200); expect(await response.json()).toMatchObject({ cleanupPending: true, message: "Your account has been deleted. Image cleanup is pending." });
  expect(mocks.cleanup).toHaveBeenCalledWith(["receipt-a", "receipt-b"]); expect(mocks.signOut).toHaveBeenCalledWith({ redirect: false });
});
it("confirms completed account and file cleanup", async () => {
  expect(await (await DELETE(req())).json()).toMatchObject({ cleanupPending: false }); expect(mocks.remove).toHaveBeenCalledExactlyOnceWith("fixture");
});
