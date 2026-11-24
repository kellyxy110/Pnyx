import { randomUUID } from "node:crypto";
import sharp from "sharp";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { changeProfileMedia } from "@/lib/profile-media";
import { attemptMediaCleanup, reserveMediaUpload } from "@/lib/media-cleanup";
import { storageTarget, isStorageConfigured, publicUrlForKey, putImage } from "@/lib/storage";

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
    const metadata = await sharp(source, { limitInputPixels: 40_000_000 }).metadata().catch(() => null);
    if (!metadata || !["jpeg", "png", "webp"].includes(metadata.format ?? "")) return NextResponse.json({ error: "Use a readable JPG, PNG, or WebP image." }, { status: 400 });
    if (!metadata.width || !metadata.height || metadata.width < rule.minWidth || metadata.height < rule.minHeight) return NextResponse.json({ error: `Image must be at least ${rule.minWidth} × ${rule.minHeight} pixels.` }, { status: 400 });
    const converted = await sharp(source, { limitInputPixels: 40_000_000 }).rotate().resize({ width: rule.width, height: rule.height, fit: "inside", withoutEnlargement: true }).webp({ quality: 82 }).toBuffer({ resolveWithObject: true });
    const key = `users/${session.user.id}/${kind}/${randomUUID()}.webp`;
    const target = storageTarget();
    if (!target) throw new Error("Storage unavailable.");
    const reservationId = await reserveMediaUpload(session.user.id, key, target);
    const stored = await putImage({ key, body: converted.data, contentType: "image/webp", bytes: converted.info.size, width: converted.info.width, height: converted.info.height }, target);
    const change = await changeProfileMedia(session.user.id, kind, stored, true, target, reservationId);
    const cleaned = await attemptMediaCleanup(change.cleanupIds);
    return NextResponse.json({ ...change.updated, bannerUrl: publicUrlForKey(change.updated.bannerKey), cleanupPending: !cleaned });
  } catch {
    console.error("[storage] profile media upload failed", { kind });
    return NextResponse.json({ error: "We could not save that image. Please try again." }, { status: 503 });
  }
}

export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const kind = new URL(request.url).searchParams.get("kind");
  if (kind !== "avatar" && kind !== "banner") return NextResponse.json({ error: "Choose a valid profile image." }, { status: 400 });
  try {
    const change = await changeProfileMedia(session.user.id, kind, null, isStorageConfigured());
    const cleaned = await attemptMediaCleanup(change.cleanupIds);
    return NextResponse.json({ deleted: true, cleanupPending: !cleaned });
  } catch {
    return NextResponse.json({ error: "The image could not be removed right now. Please try again." }, { status: 503 });
  }
}
