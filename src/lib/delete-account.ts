import { prisma } from "@/lib/prisma";
import { queueMediaCleanup } from "@/lib/media-cleanup";
import { storageTarget, type StorageTarget } from "@/lib/storage";

export async function deleteAccountWithMedia(userId: string, target: StorageTarget | null = storageTarget()) {
  return prisma.$transaction(async tx => {
    const rows = await tx.$queryRaw<{ avatarKey: string | null; bannerKey: string | null }[]>`SELECT "avatarKey", "bannerKey" FROM "User" WHERE "id" = ${userId} FOR UPDATE`;
    if (!rows[0]) throw new Error("Account unavailable.");
    await queueMediaCleanup(tx, userId, [rows[0].avatarKey, rows[0].bannerKey], target);
    await tx.user.delete({ where: { id: userId } });
    const receipts = await tx.mediaCleanup.findMany({ where: { key: { startsWith: `users/${userId}/` } }, orderBy: { key: "asc" }, select: { id: true } });
    return receipts.map(receipt => receipt.id);
  });
}
