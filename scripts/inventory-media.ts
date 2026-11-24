import { chmod, mkdir, writeFile } from "node:fs/promises";
import { ListObjectsV2Command, S3Client } from "@aws-sdk/client-s3";
import { verificationTarget, storageVerificationTarget } from "../src/lib/disposable-verification";
import { prisma } from "../src/lib/prisma";
import { classifyMediaInventory } from "../src/lib/media-inventory";

verificationTarget(process.env);
const storage = storageVerificationTarget(process.env);
if (!storage || process.argv.slice(2).length) throw new Error("Inventory requires opted-in dedicated storage and no arguments.");
async function main() {
  const client = new S3Client({ region: "auto", endpoint: storage!.endpoint, credentials: { accessKeyId: process.env.R2_ACCESS_KEY_ID!, secretAccessKey: process.env.R2_SECRET_ACCESS_KEY! } });
  try {
    const objects: { key: string; lastModified?: Date }[] = [];
    let cursor: string | undefined;
    for (let page = 0; page < 10; page++) {
      const result = await client.send(new ListObjectsV2Command({ Bucket: storage!.bucket, ContinuationToken: cursor, MaxKeys: 1000 }), { abortSignal: AbortSignal.timeout(5000) });
      for (const object of result.Contents ?? []) if (object.Key) objects.push({ key: object.Key, lastModified: object.LastModified });
      if (!result.IsTruncated) { cursor = undefined; break; }
      cursor = result.NextContinuationToken;
      if (!cursor) throw new Error("Incomplete inventory.");
    }
    if (cursor) throw new Error("Inventory exceeded bounded page limit.");
    // Query references after listing. This is still a non-atomic snapshot, never deletion proof.
    const users = await prisma.user.findMany({ select: { avatarKey: true, bannerKey: true } });
    const receipts = await prisma.mediaCleanup.findMany({ where: { endpoint: storage!.endpoint, bucket: storage!.bucket }, select: { key: true } });
    const referenced = new Set(users.flatMap(user => [user.avatarKey, user.bannerKey]).filter((key): key is string => Boolean(key)));
    const rows = classifyMediaInventory(objects, referenced, new Set(receipts.map(row => row.key)));
    const counts = { objects: rows.length, referenced: 0, tracked: 0, recent: 0, review: 0, unknown: 0 };
    for (const row of rows) counts[row.status]++;
    await mkdir("artifacts", { recursive: true, mode: 0o700 });
    await writeFile("artifacts/media-inventory-private.json", JSON.stringify({ generatedAt: new Date().toISOString(), completeListing: true, snapshotOnly: true, deletionAuthorized: false, counts, rows }, null, 2), { mode: 0o600 });
    await chmod("artifacts/media-inventory-private.json", 0o600);
    console.log(JSON.stringify({ inventory: counts, deletionAuthorized: false }));
  } finally { client.destroy(); await prisma.$disconnect(); }
}
void main().catch(() => { console.error("Isolated read-only inventory unavailable; no deletion performed."); process.exitCode = 1; });
