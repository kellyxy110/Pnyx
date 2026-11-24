import { changeProfileMedia } from "../../src/lib/profile-media";
import { randomUUID } from "node:crypto";
import { PrismaClient } from "@prisma/client";
import { expect, request, test } from "@playwright/test";
import { assertVerifiedApplication } from "../support/verified-application";
import { verificationTarget } from "./target";
import { queueMediaCleanup, processMediaCleanup, reserveMediaUpload, UPLOAD_LEASE_MS } from "../../src/lib/media-cleanup";
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

function upload(userId: string) {
  return { key: `users/${userId}/avatar/${randomUUID()}.webp`, url: "https://media.example.test/synthetic.webp", contentType: "image/webp", bytes: 100, width: 256, height: 256 };
}

test("reservation persists before upload and blocks cleanup during its lease", async () => {
  const user = await fixture(), image = upload(user.id), before = Date.now();
  const id = await reserveMediaUpload(user.id, image.key, target);
  const receipt = await db.mediaCleanup.findUniqueOrThrow({ where: { id } });
  expect(receipt.reservationExpiresAt!.getTime()).toBeGreaterThanOrEqual(before + UPLOAD_LEASE_MS);
  expect(receipt.nextAttemptAt).toEqual(receipt.reservationExpiresAt);
  let calls = 0; expect(await processMediaCleanup(id, target, async () => { calls++; })).toBe(false); expect(calls).toBe(0);
});

test("pointer adoption consumes only its live reservation atomically", async () => {
  const user = await fixture(), image = upload(user.id);
  const id = await reserveMediaUpload(user.id, image.key, target);
  const change = await changeProfileMedia(user.id, "avatar", image, true, target, id);
  expect(change.updated.avatarKey).toBe(image.key);
  expect(await db.mediaCleanup.findUnique({ where: { id } })).toBeNull();
  expect(await db.mediaCleanup.findMany({ where: { id: { in: change.cleanupIds } } })).toMatchObject([{ key: user.avatarKey }]);
});

test("expired reservations cannot be adopted even before a worker runs", async () => {
  const user = await fixture(), image = upload(user.id), id = await reserveMediaUpload(user.id, image.key, target);
  await db.mediaCleanup.update({ where: { id }, data: { reservationExpiresAt: new Date(0), nextAttemptAt: new Date(0) } });
  await expect(changeProfileMedia(user.id, "avatar", image, true, target, id)).rejects.toThrow("reservation unavailable");
  expect((await db.user.findUniqueOrThrow({ where: { id: user.id } })).avatarKey).toBe(user.avatarKey);
  expect(await db.mediaCleanup.findUnique({ where: { id } })).not.toBeNull();
});

test("failed adoption rolls back reservation consumption and the prior pointer", async () => {
  const user = await fixture(), image = upload(user.id), id = await reserveMediaUpload(user.id, image.key, target);
  await db.user.update({ where: { id: user.id }, data: { avatarKey: "users/another/avatar/invalid.webp" } });
  await expect(changeProfileMedia(user.id, "avatar", image, true, target, id)).rejects.toThrow("outside the account scope");
  expect(await db.mediaCleanup.findUnique({ where: { id } })).not.toBeNull();
  expect((await db.user.findUniqueOrThrow({ where: { id: user.id } })).avatarKey).toBe("users/another/avatar/invalid.webp");
});

test("account deletion preserves in-flight reservation and prevents late adoption", async () => {
  const user = await fixture(), image = upload(user.id), id = await reserveMediaUpload(user.id, image.key, target);
  expect(await deleteAccountWithMedia(user.id, target)).toContain(id);
  await expect(changeProfileMedia(user.id, "avatar", image, true, target, id)).rejects.toThrow("Account unavailable");
  await expect(reserveMediaUpload(user.id, upload(user.id).key, target)).rejects.toThrow("Account unavailable");
  expect(await db.mediaCleanup.findUnique({ where: { id } })).not.toBeNull();
});

test("reservation rejects foreign keys, missing targets and duplicate key renewal", async () => {
  const user = await fixture(), image = upload(user.id);
  await expect(reserveMediaUpload(user.id, "users/another/avatar/file.webp", target)).rejects.toThrow("outside the account scope");
  await expect(reserveMediaUpload(user.id, image.key, null)).rejects.toThrow("Storage unavailable");
  const id = await reserveMediaUpload(user.id, image.key, target);
  await expect(reserveMediaUpload(user.id, image.key, target)).rejects.toThrow();
  await expect(changeProfileMedia(user.id, "avatar", image, true, target)).rejects.toThrow("reservation required");
  await expect(changeProfileMedia(user.id, "avatar", image, true, { ...target, bucket: "pnyx-e2e-other" }, id)).rejects.toThrow("reservation unavailable");
});

test("abandoned upload tombstone survives provider failure and repeated late-write sweeps", async () => {
  const user = await fixture(), image = upload(user.id), id = await reserveMediaUpload(user.id, image.key, target);
  await db.mediaCleanup.update({ where: { id }, data: { reservationExpiresAt: new Date(0), nextAttemptAt: new Date(0) } });
  expect(await processMediaCleanup(id, target, async () => { throw new Error("Synthetic provider failure"); })).toBe(false);
  expect((await db.mediaCleanup.findUniqueOrThrow({ where: { id } })).reservationExpiresAt).not.toBeNull();
  let calls = 0;
  for (let i = 0; i < 2; i++) {
    await db.mediaCleanup.update({ where: { id }, data: { nextAttemptAt: new Date(0) } });
    expect(await processMediaCleanup(id, target, async key => { expect(key).toBe(image.key); calls++; })).toBe(false);
    expect((await db.mediaCleanup.findUniqueOrThrow({ where: { id } })).lastError).toBe("UPLOAD_ABANDONED");
  }
  expect(calls).toBe(2);
});
