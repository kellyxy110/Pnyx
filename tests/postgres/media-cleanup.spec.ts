import { randomUUID } from "node:crypto";
import { PrismaClient } from "@prisma/client";
import { expect, request, test } from "@playwright/test";
import { assertVerifiedApplication } from "../support/verified-application";
import { verificationTarget } from "./target";
import { queueMediaCleanup, processMediaCleanup } from "../../src/lib/media-cleanup";
import { deleteAccountWithMedia } from "../../src/lib/delete-account";

const { app } = verificationTarget(process.env);
const db = new PrismaClient();
const target = { endpoint: "https://fixture.r2.cloudflarestorage.com", bucket: "pnyx-e2e-recovery-fixture" };
const prefix = `cleanup-${randomUUID()}`;
let verified = false;
test.beforeAll(async () => { const client = await request.newContext({ baseURL: app.origin }); try { await assertVerifiedApplication(client); verified = true; } finally { await client.dispose(); } });
test.afterAll(async () => { if (verified) { await db.mediaCleanup.deleteMany({ where: { key: { startsWith: `users/${prefix}` } } }); await db.user.deleteMany({ where: { id: { startsWith: prefix } } }); } await db.$disconnect(); });

async function fixture() {
  const id = `${prefix}-${randomUUID()}`;
  const avatarKey = `users/${id}/avatar/fixture.webp`, bannerKey = `users/${id}/banner/fixture.webp`;
  await db.user.create({ data: { id, username: id, email: `${id}@example.test`, displayName: "Disposable cleanup fixture", avatarKey, bannerKey } });
  return { id, avatarKey, bannerKey };
}

test("account deletion preserves two durable receipts through provider failure and retry", async () => {
  const user = await fixture();
  const ids = await deleteAccountWithMedia(user.id, target);
  expect(await db.user.findUnique({ where: { id: user.id } })).toBeNull(); expect(ids).toHaveLength(2);
  expect(await processMediaCleanup(ids[0], target, async () => { throw new Error("Synthetic provider outage"); })).toBe(false);
  const pending = await db.mediaCleanup.findUniqueOrThrow({ where: { id: ids[0] } });
  expect(pending.key).toBe(user.avatarKey); expect(pending.attempts).toBe(1); expect(pending.lastError).toBe("PROVIDER_DELETE_FAILED");
  expect(pending.nextAttemptAt.getTime()).toBeGreaterThan(Date.now());
  let calls = 0;
  expect(await processMediaCleanup(ids[0], target, async () => { calls++; })).toBe(false); expect(calls).toBe(0);
  await db.mediaCleanup.update({ where: { id: ids[0] }, data: { nextAttemptAt: new Date(0) } });
  expect(await processMediaCleanup(ids[0], target, async key => { expect(key).toBe(user.avatarKey); calls++; })).toBe(true);
  expect(await db.mediaCleanup.findUnique({ where: { id: ids[0] } })).toBeNull();
  expect(await processMediaCleanup(ids[1], target, async key => { expect(key).toBe(user.bannerKey); })).toBe(true);
});

test("missing configuration retains account and both image pointers", async () => {
  const user = await fixture();
  await expect(deleteAccountWithMedia(user.id, null)).rejects.toThrow("Storage unavailable");
  expect(await db.user.findUniqueOrThrow({ where: { id: user.id } })).toMatchObject({ avatarKey: user.avatarKey, bannerKey: user.bannerKey });
  expect(await db.mediaCleanup.count({ where: { key: user.avatarKey } })).toBe(0);
});

test("worker refuses referenced objects and changed bucket targets", async () => {
  const user = await fixture();
  const ids = await db.$transaction(tx => queueMediaCleanup(tx, user.id, [user.avatarKey], target));
  let calls = 0;
  expect(await processMediaCleanup(ids[0], target, async () => { calls++; })).toBe(false);
  expect((await db.mediaCleanup.findUniqueOrThrow({ where: { id: ids[0] } })).lastError).toBe("OBJECT_STILL_REFERENCED");
  await db.mediaCleanup.update({ where: { id: ids[0] }, data: { nextAttemptAt: new Date(0) } });
  expect(await processMediaCleanup(ids[0], { ...target, bucket: "pnyx-e2e-other" }, async () => { calls++; })).toBe(false);
  expect(calls).toBe(0); expect((await db.mediaCleanup.findUniqueOrThrow({ where: { id: ids[0] } })).lastError).toBe("STORAGE_TARGET_UNAVAILABLE");
});

test("a rejected second receipt rolls back the first receipt and account deletion", async () => {
  const user = await fixture();
  await db.user.update({ where: { id: user.id }, data: { bannerKey: "users/someone-else/banner/fixture.webp" } });
  await expect(deleteAccountWithMedia(user.id, target)).rejects.toThrow("outside the account scope");
  expect(await db.user.findUnique({ where: { id: user.id } })).not.toBeNull();
  expect(await db.mediaCleanup.count({ where: { key: user.avatarKey } })).toBe(0);
});

test("concurrent workers delete one unreferenced receipt once", async () => {
  const user = await fixture(); const ids = await deleteAccountWithMedia(user.id, target); let calls = 0;
  const remove = async () => { calls++; await new Promise(resolve => setTimeout(resolve, 100)); };
  const results = await Promise.all([processMediaCleanup(ids[0], target, remove), processMediaCleanup(ids[0], target, remove)]);
  expect(results.filter(Boolean)).toHaveLength(1); expect(calls).toBe(1);
});

test("account deletion includes pending receipts from earlier replacements", async () => {
  const user = await fixture();
  const ids = await db.$transaction(tx => queueMediaCleanup(tx, user.id, [user.avatarKey], target));
  await db.mediaCleanup.update({ where: { id: ids[0] }, data: { nextAttemptAt: new Date(Date.now() + 60_000) } });
  await db.user.update({ where: { id: user.id }, data: { avatarKey: null, bannerKey: null } });
  expect(await deleteAccountWithMedia(user.id, null)).toEqual(ids);
  expect(await db.mediaCleanup.findUnique({ where: { id: ids[0] } })).not.toBeNull();
});
