import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { deleteObject, storageTarget, type StorageTarget } from "@/lib/storage";

function assertOwnedMediaKey(userId: string, key: string) {
  const parts = key.split("/");
  if (parts.length !== 4 || parts[0] !== "users" || parts[1] !== userId || !["avatar", "banner"].includes(parts[2]) || !/^[a-zA-Z0-9_-]+\.webp$/.test(parts[3])) throw new Error("Media cleanup key is outside the account scope.");
}

export const UPLOAD_LEASE_MS = 15 * 60 * 1000;

/** Commit provenance before any provider write, serialized with account deletion. */
export async function reserveMediaUpload(userId: string, key: string, target = storageTarget()) {
  return prisma.$transaction(async tx => {
    const rows = await tx.$queryRaw<{ id: string }[]>`SELECT "id" FROM "User" WHERE "id" = ${userId} FOR UPDATE`;
    if (!rows.length) throw new Error("Account unavailable.");
    assertOwnedMediaKey(userId, key);
    if (!target) throw new Error("Storage unavailable; media provenance must be retained.");
    const expires = new Date(Date.now() + UPLOAD_LEASE_MS);
    const receipt = await tx.mediaCleanup.create({ data: { ...target, key, reservationExpiresAt: expires, nextAttemptAt: expires }, select: { id: true } });
    return receipt.id;
  });
}

/** No user FK: deletion receipts must survive deletion of the account. */
export async function queueMediaCleanup(tx: Prisma.TransactionClient, userId: string, keys: (string | null)[], target = storageTarget()) {
  const ids: string[] = [];
  for (const key of new Set(keys.filter((key): key is string => Boolean(key)))) {
    assertOwnedMediaKey(userId, key);
    if (!target) throw new Error("Storage unavailable; media provenance must be retained.");
    const job = await tx.mediaCleanup.upsert({ where: { endpoint_bucket_key: { ...target, key } }, create: { ...target, key }, update: {}, select: { id: true } });
    ids.push(job.id);
  }
  return ids;
}

export async function processMediaCleanupDetailed(id: string, target = storageTarget(), remove: (key: string, target: StorageTarget) => Promise<void> = deleteObject) {
  return prisma.$transaction(async tx => {
    const jobs = await tx.$queryRaw<{ id: string; key: string; endpoint: string; bucket: string; attempts: number; reservationExpiresAt: Date | null }[]>`SELECT "id", "key", "endpoint", "bucket", "attempts", "reservationExpiresAt" FROM "MediaCleanup" WHERE "id" = ${id} AND "nextAttemptAt" <= NOW() AND ("reservationExpiresAt" IS NULL OR "reservationExpiresAt" <= clock_timestamp()) FOR UPDATE SKIP LOCKED`;
    const job = jobs[0];
    if (!job) return "skipped" as const;
    let failure: string | null = null;
    if (!target || job.endpoint !== target.endpoint || job.bucket !== target.bucket) failure = "STORAGE_TARGET_UNAVAILABLE";
    else if (await tx.user.count({ where: { OR: [{ avatarKey: job.key }, { bannerKey: job.key }] } })) failure = "OBJECT_STILL_REFERENCED";
    else {
      try { await remove(job.key, target); }
      catch { failure = "PROVIDER_DELETE_FAILED"; }
    }
    if (failure) {
      const delay = Math.min(3600, 30 * 2 ** Math.min(job.attempts, 7));
      await tx.mediaCleanup.update({ where: { id }, data: { attempts: { increment: 1 }, lastError: failure, nextAttemptAt: new Date(Date.now() + delay * 1000) } });
      return "failed" as const;
    }
    if (job.reservationExpiresAt) {
      // An interrupted PUT may complete late. Keep provenance and sweep again;
      // only atomic pointer adoption may retire an upload reservation.
      await tx.mediaCleanup.update({ where: { id }, data: { attempts: { increment: 1 }, lastError: "UPLOAD_ABANDONED", nextAttemptAt: new Date(Date.now() + 24 * 60 * 60 * 1000) } });
      return "swept" as const;
    }
    await tx.mediaCleanup.delete({ where: { id } });
    return "retired" as const;
  }, { timeout: 10_000 });
}

export async function processMediaCleanup(id: string, target = storageTarget(), remove: (key: string, target: StorageTarget) => Promise<void> = deleteObject) {
  return (await processMediaCleanupDetailed(id, target, remove)) === "retired";
}

export async function attemptMediaCleanup(ids: string[]) {
  const results = [];
  for (const id of ids) results.push(await processMediaCleanup(id).catch(() => false));
  return results.every(Boolean);
}
