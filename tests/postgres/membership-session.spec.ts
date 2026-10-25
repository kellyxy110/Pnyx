import { randomUUID } from "node:crypto";
import { expect, request, test, type APIRequestContext } from "@playwright/test";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { verificationTarget } from "./target";

const { app } = verificationTarget(process.env);
const db = new PrismaClient();
const runId = randomUUID().replaceAll("-", "");
const password = process.env.PNYX_FIXTURE_PASSWORD ?? `Fixture-A1-${randomUUID()}`;
const accounts = ["member", "moderator", "deleted", "suspended"].map(kind => ({
  id: `${runId}-${kind}`, email: `${runId}-${kind}@example.test`, username: `${runId.slice(0, 12)}-${kind}`,
}));
const [member, moderator, deleted, suspended] = accounts;
const spaceId = `${runId}-space`;
const slug = `verify-${runId}`;
const endpoint = `/api/spaces/${slug}/membership`;
const contexts: APIRequestContext[] = [];

async function session(account = member) {
  const client = await request.newContext({ baseURL: app.origin });
  contexts.push(client);
  const csrf = await client.get("/api/auth/csrf");
  expect(csrf.status()).toBe(200);
  const { csrfToken } = await csrf.json();
  const response = await client.post("/api/auth/callback/credentials", {
    headers: { "X-Auth-Return-Redirect": "1" },
    form: { csrfToken, email: account.email, password, callbackUrl: `${app.origin}/profile`, json: "true" },
  });
  expect(response.status()).toBe(200);
  expect((await client.get("/api/account/profile")).status()).toBe(200);
  return client;
}

async function assertResponses(responses: Awaited<ReturnType<APIRequestContext["post"]>>[], joined: boolean, members: number) {
  for (const response of responses) {
    expect(response.status()).toBe(200);
    expect(await response.json()).toEqual({ joined, members });
  }
}

test.beforeAll(async () => {
  const passwordHash = await bcrypt.hash(password, 10);
  for (const account of accounts) await db.user.create({ data: { ...account, displayName: "Native verification member", passwordHash, emailVerifiedAt: new Date() } });
  await db.space.create({ data: { id: spaceId, slug, name: "Native verification", description: "Disposable integration fixture" } });
});

test.beforeEach(async () => { await db.spaceMember.deleteMany({ where: { spaceId } }); });
test.afterEach(async () => { for (const client of contexts.splice(0)) await client.dispose(); });
test.afterAll(async () => {
  await db.space.deleteMany({ where: { id: spaceId } });
  await db.user.deleteMany({ where: { id: { in: accounts.map(account => account.id) } } });
  await db.$disconnect();
});

test("anonymous Join and Leave cannot mutate membership", async ({ request: anonymous }) => {
  expect((await anonymous.post(endpoint)).status()).toBe(401);
  expect((await anonymous.delete(endpoint)).status()).toBe(401);
  expect(await db.spaceMember.count({ where: { spaceId } })).toBe(0);
});

test("twenty simultaneous Join requests create exactly one persisted row", async () => {
  const client = await session();
  await assertResponses(await Promise.all(Array.from({ length: 20 }, () => client.post(endpoint))), true, 1);
  expect(await db.spaceMember.count({ where: { spaceId, userId: member.id } })).toBe(1);
  const spaces = await (await client.get("/api/spaces")).json();
  expect(spaces.find((space: { id: string }) => space.id === spaceId).viewer.joined).toBe(true);
});

test("simultaneous Leave requests remain idempotent", async () => {
  await db.spaceMember.create({ data: { spaceId, userId: member.id } });
  const client = await session();
  await assertResponses(await Promise.all(Array.from({ length: 20 }, () => client.delete(endpoint))), false, 0);
  expect(await db.spaceMember.count({ where: { spaceId } })).toBe(0);
});

test("moderator Leave retains membership and returns joined=true", async () => {
  await db.spaceMember.create({ data: { spaceId, userId: moderator.id, isModerator: true } });
  const client = await session(moderator);
  await assertResponses(await Promise.all(Array.from({ length: 20 }, () => client.delete(endpoint))), true, 1);
  expect(await db.spaceMember.findUnique({ where: { userId_spaceId: { userId: moderator.id, spaceId } } })).toMatchObject({ isModerator: true });
});

test("independent sessions for one user share a unique membership", async () => {
  const first = await session();
  const second = await session();
  await assertResponses(await Promise.all(Array.from({ length: 20 }, (_, index) => (index % 2 ? first : second).post(endpoint))), true, 1);
  expect(await db.spaceMember.count({ where: { spaceId } })).toBe(1);
});

test("Join, Leave, and rejoin persist across fresh API reads", async () => {
  const client = await session();
  for (const joined of [true, false, true]) {
    await assertResponses([await (joined ? client.post(endpoint) : client.delete(endpoint))], joined, joined ? 1 : 0);
    const spaces = await (await client.get("/api/spaces")).json();
    expect(spaces.find((space: { id: string }) => space.id === spaceId).viewer.joined).toBe(joined);
    expect(await db.spaceMember.count({ where: { spaceId } })).toBe(joined ? 1 : 0);
  }
});

test("deleting an account revokes its existing cookie and protected writes", async () => {
  const client = await session(deleted);
  await db.user.delete({ where: { id: deleted.id } });
  expect((await client.get("/api/account/profile")).status()).toBe(401);
  expect((await client.post(endpoint)).status()).toBe(401);
  expect(await db.spaceMember.count({ where: { spaceId } })).toBe(0);
});

test("suspension revokes an existing identity and expiry restores it", async () => {
  const client = await session(suspended);
  await db.user.update({ where: { id: suspended.id }, data: { suspendedUntil: new Date(Date.now() + 3_600_000) } });
  expect((await client.get("/api/account/profile")).status()).toBe(401);
  expect((await client.post(endpoint)).status()).toBe(401);
  await db.user.update({ where: { id: suspended.id }, data: { suspendedUntil: new Date(Date.now() - 60_000) } });
  expect((await client.get("/api/account/profile")).status()).toBe(200);
});

test("missing and private Spaces reject Join without creating rows", async () => {
  const client = await session();
  expect((await client.post("/api/spaces/nonexistent-verification-space/membership")).status()).toBe(404);
  expect((await client.delete("/api/spaces/nonexistent-verification-space/membership")).status()).toBe(404);
  await db.space.update({ where: { id: spaceId }, data: { isPublic: false } });
  try {
    expect((await client.post(endpoint)).status()).toBe(404);
    expect(await db.spaceMember.count({ where: { spaceId } })).toBe(0);
  } finally { await db.space.update({ where: { id: spaceId }, data: { isPublic: true } }); }
});
