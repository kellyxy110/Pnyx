import { beforeEach, describe, expect, it, vi } from "vitest";

const { authMock, spaceFindUnique, memberUpsert, memberDeleteMany, memberCount } = vi.hoisted(() => ({
  authMock: vi.fn(),
  spaceFindUnique: vi.fn(),
  memberUpsert: vi.fn(),
  memberDeleteMany: vi.fn(),
  memberCount: vi.fn(),
}));

vi.mock("@/auth", () => ({ auth: authMock }));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    space: { findUnique: spaceFindUnique },
    spaceMember: { upsert: memberUpsert, deleteMany: memberDeleteMany, count: memberCount },
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
    memberUpsert.mockResolvedValue({});
    memberDeleteMany.mockResolvedValue({ count: 1 });
  });

  it("rejects an unauthenticated join", async () => {
    authMock.mockResolvedValue(null);
    const response = await POST(req, { params });
    expect(response.status).toBe(401);
    expect(memberUpsert).not.toHaveBeenCalled();
  });

  it("rejects a nonexistent Space", async () => {
    spaceFindUnique.mockResolvedValue(null);
    const response = await POST(req, { params });
    expect(response.status).toBe(404);
    expect(memberUpsert).not.toHaveBeenCalled();
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
    expect(memberUpsert).toHaveBeenCalledWith({
      where: { userId_spaceId: { userId: "user_1", spaceId: "space_1" } },
      update: {},
      create: { userId: "user_1", spaceId: "space_1" },
    });
  });

  it("repeated join is idempotent: upsert never creates a second row, and the reported count does not change on the second call", async () => {
    memberCount.mockResolvedValue(6);
    await POST(req, { params });
    const second = await POST(req, { params });
    const body = await second.json();
    // Both calls go through the same upsert (update: {} on conflict) — the
    // real duplicate-prevention guarantee comes from the DB's composite
    // primary key (userId, spaceId), verified separately via schema
    // inspection since this is a mocked unit test.
    expect(memberUpsert).toHaveBeenCalledTimes(2);
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
    await DELETE(req, { params });
    expect(memberDeleteMany).toHaveBeenCalledWith(expect.objectContaining({ where: expect.objectContaining({ isModerator: false }) }));
  });
});
