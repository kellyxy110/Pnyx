import { beforeEach, describe, expect, it, vi } from "vitest";

const { authMock, spaceFindUnique, followUpsert, followDeleteMany, followCount } = vi.hoisted(() => ({
  authMock: vi.fn(),
  spaceFindUnique: vi.fn(),
  followUpsert: vi.fn(),
  followDeleteMany: vi.fn(),
  followCount: vi.fn(),
}));

vi.mock("@/auth", () => ({ auth: authMock }));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    space: { findUnique: spaceFindUnique },
    spaceFollow: { upsert: followUpsert, deleteMany: followDeleteMany, count: followCount },
  },
}));

import { POST, DELETE } from "./route";

const params = Promise.resolve({ slug: "ai" });
const req = new Request("http://localhost/api/spaces/ai/follow");

describe("POST/DELETE /api/spaces/[slug]/follow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authMock.mockResolvedValue({ user: { id: "user_1" } });
    spaceFindUnique.mockResolvedValue({ id: "space_1" });
    followUpsert.mockResolvedValue({});
    followDeleteMany.mockResolvedValue({ count: 1 });
  });

  it("rejects an unauthenticated follow", async () => {
    authMock.mockResolvedValue(null);
    const response = await POST(req, { params });
    expect(response.status).toBe(401);
    expect(followUpsert).not.toHaveBeenCalled();
  });

  it("rejects following a nonexistent Space", async () => {
    spaceFindUnique.mockResolvedValue(null);
    const response = await POST(req, { params });
    expect(response.status).toBe(404);
  });

  it("follows once and returns the authoritative follower count", async () => {
    followCount.mockResolvedValue(4);
    const response = await POST(req, { params });
    const body = await response.json();
    expect(body).toEqual({ following: true, followers: 4 });
    expect(followUpsert).toHaveBeenCalledWith({
      where: { userId_spaceId: { userId: "user_1", spaceId: "space_1" } },
      update: {},
      create: { userId: "user_1", spaceId: "space_1" },
    });
  });

  it("repeated follow is idempotent and reports the same authoritative count", async () => {
    followCount.mockResolvedValue(4);
    await POST(req, { params });
    const second = await POST(req, { params });
    const body = await second.json();
    expect(followUpsert).toHaveBeenCalledTimes(2);
    expect(body).toEqual({ following: true, followers: 4 });
  });

  it("unfollows once and returns the decremented authoritative count", async () => {
    followCount.mockResolvedValue(3);
    const response = await DELETE(req, { params });
    const body = await response.json();
    expect(body).toEqual({ following: false, followers: 3 });
  });

  it("repeated unfollow does not error and does not decrement further", async () => {
    followDeleteMany.mockResolvedValue({ count: 0 });
    followCount.mockResolvedValue(3);
    const response = await DELETE(req, { params });
    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body).toEqual({ following: false, followers: 3 });
  });

  it("rejects an unauthenticated unfollow", async () => {
    authMock.mockResolvedValue(null);
    const response = await DELETE(req, { params });
    expect(response.status).toBe(401);
    expect(followDeleteMany).not.toHaveBeenCalled();
  });
});
