import { beforeEach, describe, expect, it, vi } from "vitest";

const { userFindUnique } = vi.hoisted(() => ({ userFindUnique: vi.fn() }));

vi.mock("@/lib/prisma", () => ({
  prisma: { user: { findUnique: userFindUnique } },
}));

import { resolveTokenUserId } from "./auth-session";

describe("resolveTokenUserId", () => {
  beforeEach(() => vi.clearAllMocks());

  it("assigns userId from a fresh DB lookup on sign-in", async () => {
    userFindUnique.mockResolvedValue({ id: "user_1", suspendedUntil: null });
    const token = await resolveTokenUserId({}, { id: "user_1", email: "Person@Example.com" });
    expect(token.userId).toBe("user_1");
    expect(userFindUnique).toHaveBeenCalledWith({ where: { email: "person@example.com" }, select: { id: true, suspendedUntil: true } });
  });

  it("re-resolves userId by email on a later session read (no user param)", async () => {
    userFindUnique.mockResolvedValue({ id: "user_1", suspendedUntil: null });
    const token = await resolveTokenUserId({ email: "person@example.com", userId: "user_1" }, undefined);
    expect(token.userId).toBe("user_1");
  });

  it("clears userId for a currently suspended account", async () => {
    userFindUnique.mockResolvedValue({ id: "user_1", suspendedUntil: new Date(Date.now() + 60_000) });
    const token = await resolveTokenUserId({ email: "person@example.com", userId: "user_1" }, undefined);
    expect(token.userId).toBeUndefined();
  });

  it("restores userId once a past suspension has expired", async () => {
    userFindUnique.mockResolvedValue({ id: "user_1", suspendedUntil: new Date(Date.now() - 60_000) });
    const token = await resolveTokenUserId({ email: "person@example.com" }, undefined);
    expect(token.userId).toBe("user_1");
  });

  it("keeps the existing userId when the DB call fails on a routine session read", async () => {
    userFindUnique.mockRejectedValue(new Error("connection reset"));
    const token = await resolveTokenUserId({ email: "person@example.com", userId: "user_1" }, undefined);
    expect(token.userId).toBe("user_1");
  });

  it("falls back to the freshly-issued user.id when the DB is unreachable on first sign-in", async () => {
    userFindUnique.mockRejectedValue(new Error("connection reset"));
    const token = await resolveTokenUserId({}, { id: "user_1", email: "person@example.com" });
    expect(token.userId).toBe("user_1");
  });

  it("never invents a userId from a DB failure alone when there is nothing to fall back to", async () => {
    userFindUnique.mockRejectedValue(new Error("connection reset"));
    const token = await resolveTokenUserId({ email: "person@example.com" }, undefined);
    expect(token.userId).toBeUndefined();
  });

  it("assigns userId directly from user.id when no email is available", async () => {
    const token = await resolveTokenUserId({}, { id: "user_1", email: null });
    expect(token.userId).toBe("user_1");
    expect(userFindUnique).not.toHaveBeenCalled();
  });
});
