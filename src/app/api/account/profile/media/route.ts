import { randomUUID } from "node:crypto";
import sharp from "sharp";
import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { deleteObject, isStorageConfigured, publicUrlForKey, putImage } from "@/lib/storage";

const limits = { avatar: { maxBytes: 5 * 1024 * 1024, width: 512, height: 512, minWidth: 128, minHeight: 128 }, banner: { maxBytes: 10 * 1024 * 1024, width: 1600, height: 500, minWidth: 600, minHeight: 160 } } as const;
type Kind = keyof typeof limits;

export function GET() { return NextResponse.json({ enabled: isStorageConfigured() }); }

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  if (!isStorageConfigured()) return NextResponse.json({ error: "Profile image uploads are not available yet." }, { status: 503 });
  const form = await request.formData().catch(() => null);
  const kind = form?.get("kind");
  const file = form?.get("file");
  if ((kind !== "avatar" && kind !== "banner") || !(file instanceof File)) return NextResponse.json({ error: "Choose a valid profile image." }, { status: 400 });
  const rule = limits[kind as Kind];
  if (!file.type.startsWith("image/") || !["image/jpeg", "image/png", "image/webp"].includes(file.type)) return NextResponse.json({ error: "Use a JPG, PNG, or WebP image." }, { status: 400 });
  if (file.size > rule.maxBytes) return NextResponse.json({ error: `Image must be smaller than ${rule.maxBytes / 1024 / 1024} MB.` }, { status: 400 });
  try {
    const source = Buffer.from(await file.arrayBuffer());
    const metadata = await sharp(source).metadata();
    if (!metadata.width || !metadata.height || metadata.width < rule.minWidth || metadata.height < rule.minHeight) return NextResponse.json({ error: `Image must be at least ${rule.minWidth} × ${rule.minHeight} pixels.` }, { status: 400 });
    const converted = await sharp(source).rotate().resize({ width: rule.width, height: rule.height, fit: "inside", withoutEnlargement: true }).webp({ quality: 82 }).toBuffer({ resolveWithObject: true });
    const key = `users/${session.user.id}/${kind}/${randomUUID()}.webp`;
    const stored = await putImage({ key, body: converted.data, contentType: "image/webp", bytes: converted.info.size, width: converted.info.width, height: converted.info.height });
    const existing = await prisma.user.findUnique({ where: { id: session.user.id }, select: { avatarKey: true, bannerKey: true } });
    const mediaMetadata = { contentType: stored.contentType, bytes: stored.bytes, width: stored.width, height: stored.height };
    let updated;
    try {
      updated = await prisma.user.update({ where: { id: session.user.id }, data: kind === "avatar" ? { avatarKey: stored.key, avatarUrl: stored.url, avatarMetadata: mediaMetadata } : { bannerKey: stored.key, bannerMetadata: mediaMetadata }, select: { avatarUrl: true, avatarKey: true, bannerKey: true } });
    } catch (error) {
      await deleteObject(stored.key).catch((cleanupError) => console.error("[storage] failed to clean up unlinked upload", { kind, error: cleanupError instanceof Error ? cleanupError.message : "unknown" }));
      throw error;
    }
    await deleteObject(kind === "avatar" ? existing?.avatarKey : existing?.bannerKey).catch((error) => console.error("[storage] orphan cleanup failed", { kind, error: error instanceof Error ? error.message : "unknown" }));
    return NextResponse.json({ ...updated, bannerUrl: publicUrlForKey(updated.bannerKey) });
  } catch (error) {
    console.error("[storage] profile media upload failed", { kind, error: error instanceof Error ? error.message : "unknown" });
    return NextResponse.json({ error: "We could not save that image. Please try again." }, { status: 503 });
  }
}

export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const kind = new URL(request.url).searchParams.get("kind");
  if (kind !== "avatar" && kind !== "banner") return NextResponse.json({ error: "Choose a valid profile image." }, { status: 400 });
  const existing = await prisma.user.findUnique({ where: { id: session.user.id }, select: { avatarKey: true, bannerKey: true } });
  const key = kind === "avatar" ? existing?.avatarKey : existing?.bannerKey;
  await prisma.user.update({ where: { id: session.user.id }, data: kind === "avatar" ? { avatarKey: null, avatarUrl: null, avatarMetadata: Prisma.JsonNull } : { bannerKey: null, bannerMetadata: Prisma.JsonNull } });
  await deleteObject(key).catch((error) => console.error("[storage] profile media deletion failed", { kind, error: error instanceof Error ? error.message : "unknown" }));
  return NextResponse.json({ deleted: true });
}
