import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { StoredImage } from "@/lib/storage";
import { storageTarget, type StorageTarget } from "@/lib/storage";
import { queueMediaCleanup } from "@/lib/media-cleanup";

/** Serialize pointer swaps; keep slow object-store calls outside the row lock. */
export async function changeProfileMedia(userId: string, kind: "avatar" | "banner", image: StoredImage | null, storageEnabled = true, target: StorageTarget | null = storageTarget(), reservationId?: string) {
  return prisma.$transaction(async tx => {
    const rows = await tx.$queryRaw<{ avatarKey: string | null; bannerKey: string | null }[]>`SELECT "avatarKey", "bannerKey" FROM "User" WHERE "id" = ${userId} FOR UPDATE`;
    const row = rows[0];
    if (!row) throw new Error("Account unavailable.");
    if (image && !reservationId) throw new Error("Upload reservation required.");
    if (reservationId) {
      const receipts = await tx.$queryRaw<{ key: string; endpoint: string; bucket: string; valid: boolean }[]>`SELECT "key", "endpoint", "bucket", ("reservationExpiresAt" > clock_timestamp() AND "attempts" = 0) AS "valid" FROM "MediaCleanup" WHERE "id" = ${reservationId} FOR UPDATE`;
      const receipt = receipts[0];
      if (!image || !receipt?.valid || receipt.key !== image.key || !image.key.startsWith(`users/${userId}/${kind}/`) || receipt.endpoint !== target?.endpoint || receipt.bucket !== target?.bucket) throw new Error("Upload reservation unavailable.");
      const consumed = await tx.$queryRaw<{ id: string }[]>`DELETE FROM "MediaCleanup" WHERE "id" = ${reservationId} AND "reservationExpiresAt" > clock_timestamp() AND "attempts" = 0 RETURNING "id"`;
      if (!consumed.length) throw new Error("Upload reservation unavailable.");
    }
    const oldKey = kind === "avatar" ? row.avatarKey : row.bannerKey;
    if (!image && oldKey && !storageEnabled) throw new Error("Storage unavailable; image removal was not applied.");
    const cleanupIds = await queueMediaCleanup(tx, userId, oldKey && oldKey !== image?.key ? [oldKey] : [], target);
    const metadata = image ? { contentType: image.contentType, bytes: image.bytes, width: image.width, height: image.height } : Prisma.JsonNull;
    const updated = await tx.user.update({ where: { id: userId }, data: kind === "avatar" ? { avatarKey: image?.key ?? null, avatarUrl: image?.url ?? null, avatarMetadata: metadata } : { bannerKey: image?.key ?? null, bannerMetadata: metadata }, select: { avatarUrl: true, avatarKey: true, bannerKey: true } });
    return { oldKey, updated, cleanupIds };
  });
}
