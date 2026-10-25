import { beforeEach, describe, expect, it, vi } from "vitest";

const { userFindUnique } = vi.hoisted(() => ({ userFindUnique: vi.fn() }));
vi.mock("@/lib/prisma", () => ({ prisma: { user: { findUnique: userFindUnique } } }));
import { resolveTokenUserId } from "./auth-session";

describe("resolveTokenUserId identity lifecycle", () => {
  beforeEach(() => vi.resetAllMocks());

  it("revokes an existing userId after a successful lookup confirms account deletion", async () => {
    userFindUnique.mockResolvedValue(null);
    const token = await resolveTokenUserId({ email: "deleted@example.com", userId: "deleted_user" }, undefined);
    expect(token.userId).toBeUndefined();
  });

  it("does not trust a fresh userId when a successful lookup confirms no account", async () => {
    userFindUnique.mockResolvedValue(null);
    const token = await resolveTokenUserId({ email: "deleted@example.com" }, { id: "deleted_user", email: "deleted@example.com" });
    expect(token.userId).toBeUndefined();
  });

  it("preserves a valid token during transient database errors", async () => {
    userFindUnique.mockRejectedValue(new Error("connection unavailable"));
    const token = await resolveTokenUserId({ email: "active@example.com", userId: "active_user" }, undefined);
    expect(token.userId).toBe("active_user");
  });

  it("revokes suspended accounts", async () => {
    userFindUnique.mockResolvedValue({ id: "active_user", suspendedUntil: new Date(Date.now() + 3600000) });
    const token = await resolveTokenUserId({ email: "active@example.com", userId: "active_user" }, undefined);
    expect(token.userId).toBeUndefined();
  });
});
