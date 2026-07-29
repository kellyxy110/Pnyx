import { beforeEach, describe, expect, it, vi } from "vitest";

const { userFindUnique, userCreate, accountFindUnique, accountCreate } = vi.hoisted(() => ({
  userFindUnique: vi.fn(),
  userCreate: vi.fn(),
  accountFindUnique: vi.fn(),
  accountCreate: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: { findUnique: userFindUnique, create: userCreate },
    oAuthAccount: { findUnique: accountFindUnique, create: accountCreate },
  },
}));

import { ensureOAuthUser, usernameBase } from "./oauth-account";

describe("OAuth account linking", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    accountFindUnique.mockResolvedValue(null);
    userFindUnique.mockResolvedValue(null);
    accountCreate.mockResolvedValue({});
  });

  it("creates a verified user and provider link on first OAuth login", async () => {
    userCreate.mockResolvedValue({ id: "user_1", email: "person@example.com", displayName: "Person", suspendedUntil: null });
    const user: { id?: string; email: string; name: string } = { email: "Person@Example.com", name: "Person" };
    const result = await ensureOAuthUser(user, { provider: "google", providerAccountId: "google_1" });
    expect(result?.id).toBe("user_1");
    expect(user.id).toBe("user_1");
    expect(user.email).toBe("person@example.com");
    expect(userCreate).toHaveBeenCalledOnce();
    expect(accountCreate).toHaveBeenCalledWith({ data: { provider: "google", providerAccountId: "google_1", userId: "user_1" } });
  });

  it("reuses the same user on repeated login without duplicating the link", async () => {
    accountFindUnique.mockResolvedValue({ userId: "user_1" });
    userFindUnique.mockResolvedValue({ id: "user_1", email: "person@example.com", displayName: "Person", suspendedUntil: null });
    const user: { id?: string; email: string; name: string } = { email: "person@example.com", name: "Person" };
    const result = await ensureOAuthUser(user, { provider: "github", providerAccountId: "github_1" });
    expect(result?.id).toBe("user_1");
    expect(userCreate).not.toHaveBeenCalled();
    expect(accountCreate).not.toHaveBeenCalled();
  });

  it("rejects a provider account already linked to a different user", async () => {
    accountFindUnique.mockResolvedValue({ userId: "different_user" });
    userFindUnique.mockResolvedValue({ id: "user_1", email: "person@example.com", displayName: "Person", suspendedUntil: null });
    await expect(ensureOAuthUser({ email: "person@example.com", name: "Person" }, { provider: "google", providerAccountId: "google_1" })).resolves.toBeNull();
    expect(userCreate).not.toHaveBeenCalled();
    expect(accountCreate).not.toHaveBeenCalled();
  });

  it("creates safe lowercase username bases", () => {
    expect(usernameBase("Kelly.Xy+beta@example.com")).toBe("kelly-xy-beta");
    expect(usernameBase("@example.com")).toBe("pnyx-member");
  });
});



