import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { StoredImage } from "@/lib/storage";
import { storageTarget, type StorageTarget } from "@/lib/storage";
import { queueMediaCleanup } from "@/lib/media-cleanup";

/** Serialize pointer swaps; keep slow object-store calls outside the row lock. */
export async function changeProfileMedia(userId: string, kind: "avatar" | "banner", image: StoredImage | null, storageEnabled = true, target: StorageTarget | null = storageTarget()) {
  return prisma.$transaction(async tx => {
    const rows = await tx.$queryRaw<{ avatarKey: string | null; bannerKey: string | null }[]>`SELECT "avatarKey", "bannerKey" FROM "User" WHERE "id" = ${userId} FOR UPDATE`;
    const row = rows[0];
    if (!row) throw new Error("Account unavailable.");
    const oldKey = kind === "avatar" ? row.avatarKey : row.bannerKey;
    if (!image && oldKey && !storageEnabled) throw new Error("Storage unavailable; image removal was not applied.");
    const cleanupIds = await queueMediaCleanup(tx, userId, oldKey && oldKey !== image?.key ? [oldKey] : [], target);
    const metadata = image ? { contentType: image.contentType, bytes: image.bytes, width: image.width, height: image.height } : Prisma.JsonNull;
    const updated = await tx.user.update({ where: { id: userId }, data: kind === "avatar" ? { avatarKey: image?.key ?? null, avatarUrl: image?.url ?? null, avatarMetadata: metadata } : { bannerKey: image?.key ?? null, bannerMetadata: metadata }, select: { avatarUrl: true, avatarKey: true, bannerKey: true } });
    return { oldKey, updated, cleanupIds };
  });
}
