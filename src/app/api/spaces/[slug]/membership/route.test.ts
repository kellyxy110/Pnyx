import { beforeEach, describe, expect, it, vi } from "vitest";

const { authMock, spaceFindUnique, memberCreateMany, memberDeleteMany, memberCount, memberFindUnique, transaction } = vi.hoisted(() => ({
  authMock: vi.fn(),
  spaceFindUnique: vi.fn(),
  memberCreateMany: vi.fn(),
  memberDeleteMany: vi.fn(),
  memberCount: vi.fn(),
  memberFindUnique: vi.fn(),
  transaction: vi.fn(),
}));

vi.mock("@/auth", () => ({ auth: authMock }));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    $transaction: transaction,
    space: { findUnique: spaceFindUnique },
    spaceMember: { createMany: memberCreateMany, deleteMany: memberDeleteMany, count: memberCount, findUnique: memberFindUnique },
  },
}));

import { POST, DELETE } from "./route";

const params = Promise.resolve({ slug: "ai" });
const req = new Request("http://localhost/api/spaces/ai/membership");

describe("POST/DELETE /api/spaces/[slug]/membership", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authMock.mockResolvedValue({ user: { id: "user_1" } });
    spaceFindUnique.mockResolvedValue({ id: "space_1", isPublic: true });
    memberCreateMany.mockResolvedValue({});
    memberDeleteMany.mockResolvedValue({ count: 1 });
    memberFindUnique.mockResolvedValue(null);
    transaction.mockImplementation((operations: Promise<unknown>[]) => Promise.all(operations));
  });

  it("rejects an unauthenticated join", async () => {
    authMock.mockResolvedValue(null);
    const response = await POST(req, { params });
    expect(response.status).toBe(401);
    expect(memberCreateMany).not.toHaveBeenCalled();
  });

  it("rejects a nonexistent Space", async () => {
    spaceFindUnique.mockResolvedValue(null);
    const response = await POST(req, { params });
    expect(response.status).toBe(404);
    expect(memberCreateMany).not.toHaveBeenCalled();
  });

  it("rejects joining a non-public Space", async () => {
    spaceFindUnique.mockResolvedValue({ id: "space_1", isPublic: false });
    const response = await POST(req, { params });
    expect(response.status).toBe(404);
  });

  it("joins once and returns the authoritative count from the database, not a client guess", async () => {
    memberCount.mockResolvedValue(6);
    const response = await POST(req, { params });
    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body).toEqual({ joined: true, members: 6 });
    expect(memberCreateMany).toHaveBeenCalledWith({
      data: { userId: "user_1", spaceId: "space_1" },
      skipDuplicates: true,
    });
  });

  it("repeated join requests use conflict-tolerant insertion and return the database count", async () => {
    memberCount.mockResolvedValue(6);
    await POST(req, { params });
    const second = await POST(req, { params });
    const body = await second.json();
    // Native PostgreSQL integration checks exercise the actual unique-key
    // behavior; this unit test checks the route contract only.
    expect(memberCreateMany).toHaveBeenCalledTimes(2);
    expect(body).toEqual({ joined: true, members: 6 });
  });

  it("two concurrent joins both resolve successfully and read the same authoritative count", async () => {
    memberCount.mockResolvedValue(6);
    const [a, b] = await Promise.all([POST(req, { params }), POST(req, { params })]);
    const [bodyA, bodyB] = await Promise.all([a.json(), b.json()]);
    expect(bodyA).toEqual({ joined: true, members: 6 });
    expect(bodyB).toEqual({ joined: true, members: 6 });
  });

  it("leaves once and returns the decremented authoritative count", async () => {
    memberCount.mockResolvedValue(5);
    const response = await DELETE(req, { params });
    const body = await response.json();
    expect(body).toEqual({ joined: false, members: 5 });
    expect(memberDeleteMany).toHaveBeenCalledWith({ where: { userId: "user_1", spaceId: "space_1", isModerator: false } });
  });

  it("repeated leave does not error and does not decrement further", async () => {
    memberDeleteMany.mockResolvedValue({ count: 0 });
    memberCount.mockResolvedValue(5);
    const response = await DELETE(req, { params });
    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body).toEqual({ joined: false, members: 5 });
  });

  it("rejects an unauthenticated leave", async () => {
    authMock.mockResolvedValue(null);
    const response = await DELETE(req, { params });
    expect(response.status).toBe(401);
    expect(memberDeleteMany).not.toHaveBeenCalled();
  });

  it("rejects leaving a nonexistent Space", async () => {
    spaceFindUnique.mockResolvedValue(null);
    const response = await DELETE(req, { params });
    expect(response.status).toBe(404);
  });

  it("never removes a moderator's membership via Leave", async () => {
    memberCount.mockResolvedValue(6);
    memberFindUnique.mockResolvedValue({ userId: "user_1" });
    const response = await DELETE(req, { params });
    expect(await response.json()).toEqual({ joined: true, members: 6 });
    expect(memberDeleteMany).toHaveBeenCalledWith(expect.objectContaining({ where: expect.objectContaining({ isModerator: false }) }));
  });
});
