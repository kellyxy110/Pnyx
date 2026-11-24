import { runMediaCleanupBatch, cleanupWorkerId } from "../../src/lib/media-cleanup-worker";
import { reserveMediaUpload, processMediaCleanup } from "../../src/lib/media-cleanup";
import { putImage } from "../../src/lib/storage";
import { DeleteObjectCommand, HeadObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { PrismaClient } from "@prisma/client";
import sharp from "sharp";
import bcrypt from "bcryptjs";
import { randomUUID } from "node:crypto";
import { expect, test } from "@playwright/test";
import { authenticatedVerificationTarget } from "../../src/lib/disposable-verification";
import { assertVerifiedApplication } from "../support/verified-application";

const target = authenticatedVerificationTarget(process.env);
const storage = target?.storage;

test.describe("dedicated R2 media acceptance", () => {
  test.skip(!storage, "Requires verified disposable app/database, synthetic account and explicitly matching pnyx-e2e bucket/delivery configuration.");
  test.beforeAll(async ({ request }) => { if (storage) await assertVerifiedApplication(request); });

  for (const kind of ["avatar", "banner"] as const) {
    test(`${kind} upload, reload, replacement and origin removal persist`, async ({ page }) => {
      const db = new PrismaClient();
      const s3 = new S3Client({ region: "auto", endpoint: storage!.endpoint, credentials: { accessKeyId: process.env.R2_ACCESS_KEY_ID!, secretAccessKey: process.env.R2_SECRET_ACCESS_KEY! } });
      const fixture = await db.user.findUniqueOrThrow({ where: { email: process.env.E2E_EMAIL! }, select: { id: true, avatarKey: true, bannerKey: true } }).catch(async () => { s3.destroy(); await db.$disconnect(); throw new Error("Dedicated media fixture is unavailable."); });
      const field = kind === "avatar" ? "avatarKey" : "bannerKey";
      const prefix = `users/${fixture.id}/${kind}/`;
      const keys = new Set<string>();
      let ownsFixture = false;
      function ownKey(key: string | null | undefined): asserts key is string {
        if (!key || !key.startsWith(prefix) || !/^[a-zA-Z0-9_/-]+\.webp$/.test(key)) throw new Error("Media receipt is outside the fixture key scope.");
      }
      async function receipt() {
        const user = await db.user.findUniqueOrThrow({ where: { id: fixture.id }, select: { avatarKey: true, bannerKey: true, avatarMetadata: true, bannerMetadata: true } });
        const key = user[field]; ownKey(key); keys.add(key);
        expect(user[kind === "avatar" ? "avatarMetadata" : "bannerMetadata"]).toMatchObject({ contentType: "image/webp" });
        const object = await s3.send(new HeadObjectCommand({ Bucket: storage!.bucket, Key: key }));
        expect(object.ContentType).toBe("image/webp"); expect(object.ContentLength).toBeGreaterThan(0); expect(object.CacheControl).toBe("no-store");
        return key;
      }
      async function absent(key: string) {
        ownKey(key);
        try { await s3.send(new HeadObjectCommand({ Bucket: storage!.bucket, Key: key })); }
        catch (error) { if (typeof error === "object" && error && "$metadata" in error && (error.$metadata as { httpStatusCode?: number }).httpStatusCode === 404) return; throw error; }
        throw new Error("Prior fixture object remains at the storage origin.");
      }
      try {
        expect(fixture[field], "Media fixture must start empty; pre-existing media will not be replaced.").toBeNull(); ownsFixture = true;
        await page.goto("/sign-in"); await page.getByLabel("Email", { exact: true }).fill(process.env.E2E_EMAIL!); await page.getByLabel("Password", { exact: true }).fill(process.env.E2E_PASSWORD!); await page.getByRole("button", { name: "Sign in to Pnyx" }).click(); await expect(page).toHaveURL(/\/profile/);
        await page.getByRole("button", { name: "Edit profile", exact: true }).click();
        const input = page.getByLabel(kind === "avatar" ? "Avatar image" : "Banner image", { exact: true });
        const first = await sharp({ create: { width: kind === "avatar" ? 256 : 800, height: kind === "avatar" ? 256 : 240, channels: 3, background: "#2040cc" } }).png().toBuffer();
        await input.setInputFiles({ name: `${kind}-first.png`, mimeType: "image/png", buffer: first });
        await expect(page.locator(".profile-message.success")).toContainText(`${kind === "avatar" ? "Avatar" : "Banner"} updated.`, { timeout: 15_000 });
        const original = await receipt();
        const delivery = await page.request.get(`${storage!.publicBase}/${original}`, { maxRedirects: 0 }); expect(delivery.status()).toBe(200); expect(delivery.headers()["content-type"]).toContain("image/webp");
        const cache = delivery.headers()["cache-control"]?.toLowerCase().split(",").map(value => value.trim()) ?? [];
        expect(cache).toContain("no-store"); expect(cache).not.toContain("immutable");
        expect(["HIT", "STALE", "UPDATING", "REVALIDATED"]).not.toContain(delivery.headers()["cf-cache-status"]?.toUpperCase());
        expect(Number(delivery.headers().age ?? 0)).toBe(0);
        const deliveredBody = await delivery.body();
        const delivered = await sharp(deliveredBody).metadata(); expect(delivered.format).toBe("webp");
        const pixels = await sharp(deliveredBody).raw().toBuffer(); expect(pixels.byteLength).toBeGreaterThan(0);
        expect(delivered.width).toBeGreaterThanOrEqual(kind === "avatar" ? 128 : 600);
        expect(delivered.height).toBeGreaterThanOrEqual(kind === "avatar" ? 128 : 160);
        await page.reload(); expect(await receipt()).toBe(original);
        await page.getByRole("button", { name: "Edit profile", exact: true }).click();
        const second = await sharp(first).tint("#cc4020").png().toBuffer();
        await input.setInputFiles({ name: `${kind}-second.png`, mimeType: "image/png", buffer: second });
        await expect(page.locator(".profile-message.success")).toContainText(`${kind === "avatar" ? "Avatar" : "Banner"} updated.`, { timeout: 15_000 });
        const replacement = await receipt(); expect(replacement).not.toBe(original); await absent(original);
        let releaseRemoval!: () => void;
        const removalGate = new Promise<void>(resolve => { releaseRemoval = resolve; });
        const mediaRoute = "**/api/account/profile/media?kind=*";
        await page.route(mediaRoute, async route => { if (route.request().method() === "DELETE") await removalGate; await route.continue(); });
        try {
          await page.getByRole("button", { name: `Remove ${kind}`, exact: true }).click();
          await expect(page.getByRole("status")).toHaveText(`Removing ${kind}…`);
          await expect(page.locator(".profile-message.success")).toHaveCount(0);
          await expect(page.getByRole("button", { name: "Save profile", exact: true })).toBeDisabled();
        } finally { releaseRemoval(); }
        await expect(page.locator(".profile-message.success")).toContainText(`${kind === "avatar" ? "Avatar" : "Banner"} removed.`);
        await page.unroute(mediaRoute);
        await page.reload(); const removed = await db.user.findUniqueOrThrow({ where: { id: fixture.id }, select: { avatarKey: true, bannerKey: true } }); expect(removed[field]).toBeNull(); await absent(replacement);
      } finally {
        try {
        if (ownsFixture) {
          const current = await db.user.findUnique({ where: { id: fixture.id }, select: { avatarKey: true, bannerKey: true } });
          const key = current?.[field];
          if (key) { ownKey(key); keys.add(key); const cleanup = await page.request.delete(`/api/account/profile/media?kind=${kind}`); if (!cleanup.ok()) throw new Error("Fixture media pointer cleanup failed."); }
          for (const owned of keys) { ownKey(owned); await s3.send(new DeleteObjectCommand({ Bucket: storage!.bucket, Key: owned })); }
        }
        } finally { s3.destroy(); await db.$disconnect(); }
      }
    });
  }

  test("deleting a disposable account removes both real images and delivery URLs", async ({ page }) => {
    const db = new PrismaClient();
    const s3 = new S3Client({ region: "auto", endpoint: storage!.endpoint, credentials: { accessKeyId: process.env.R2_ACCESS_KEY_ID!, secretAccessKey: process.env.R2_SECRET_ACCESS_KEY! } });
    const id = `media-deletion-${randomUUID()}`, email = `${id}@example.test`;
    const keys = new Set<string>();
    function ownKey(key: string | null): asserts key is string { if (!key || !key.startsWith(`users/${id}/`) || !/^users\/[a-zA-Z0-9_-]+\/(avatar|banner)\/[a-zA-Z0-9_-]+\.webp$/.test(key)) throw new Error("Account deletion fixture key is out of scope."); }
    try {
      await db.user.create({ data: { id, username: id, email, displayName: "Disposable media deletion fixture", passwordHash: await bcrypt.hash(process.env.E2E_PASSWORD!, 10), emailVerifiedAt: new Date() } });
      await page.goto("/sign-in"); await page.getByLabel("Email", { exact: true }).fill(email); await page.getByLabel("Password", { exact: true }).fill(process.env.E2E_PASSWORD!); await page.getByRole("button", { name: "Sign in to Pnyx" }).click(); await expect(page).toHaveURL(/\/profile/);
      await page.getByRole("button", { name: "Edit profile", exact: true }).click();
      const image = await sharp({ create: { width: 800, height: 240, channels: 3, background: "#3050aa" } }).png().toBuffer();
      for (const kind of ["avatar", "banner"] as const) {
        await page.getByLabel(kind === "avatar" ? "Avatar image" : "Banner image", { exact: true }).setInputFiles({ name: `${kind}.png`, mimeType: "image/png", buffer: image });
        await expect(page.locator(".profile-message.success")).toContainText(`${kind === "avatar" ? "Avatar" : "Banner"} updated.`);
        const user = await db.user.findUniqueOrThrow({ where: { id }, select: { avatarKey: true, bannerKey: true } });
        const key = user[kind === "avatar" ? "avatarKey" : "bannerKey"]; ownKey(key); keys.add(key);
        expect((await s3.send(new HeadObjectCommand({ Bucket: storage!.bucket, Key: key }))).ContentLength).toBeGreaterThan(0);
        expect((await page.request.get(`${storage!.publicBase}/${key}`, { maxRedirects: 0 })).status()).toBe(200);
      }
      const deleted = await page.request.delete("/api/account/delete", { data: { confirmation: "DELETE MY ACCOUNT" } });
      expect(deleted.status()).toBe(200); expect((await deleted.json()).cleanupPending).toBe(false);
      expect(await db.user.findUnique({ where: { id } })).toBeNull(); expect((await page.request.get("/api/account/profile")).status()).toBe(401);
      for (const key of keys) {
        await expect(s3.send(new HeadObjectCommand({ Bucket: storage!.bucket, Key: key }))).rejects.toMatchObject({ $metadata: { httpStatusCode: 404 } });
        await expect.poll(async () => (await page.request.get(`${storage!.publicBase}/${key}`, { maxRedirects: 0 })).status()).toBe(404);
      }
      expect(await db.mediaCleanup.count({ where: { key: { startsWith: `users/${id}/` } } })).toBe(0);
    } finally {
      try {
        const user = await db.user.findUnique({ where: { id }, select: { avatarKey: true, bannerKey: true } });
        for (const key of [user?.avatarKey, user?.bannerKey]) if (key) { ownKey(key); keys.add(key); }
        for (const key of keys) { ownKey(key); await s3.send(new DeleteObjectCommand({ Bucket: storage!.bucket, Key: key })); }
        await db.mediaCleanup.deleteMany({ where: { key: { in: [...keys] } } });
        await db.user.deleteMany({ where: { id } });
      } finally { s3.destroy(); await db.$disconnect(); }
    }
  });
  test("abandoned upload reservation recovers a real object and a later repeated write", async ({ request }) => {
    const db = new PrismaClient();
    const id = `media-reservation-${randomUUID()}`, key = `users/${id}/avatar/${randomUUID()}.webp`;
    const scopedTarget = { endpoint: storage!.endpoint, bucket: storage!.bucket };
    const s3 = new S3Client({ region: "auto", endpoint: storage!.endpoint, credentials: { accessKeyId: process.env.R2_ACCESS_KEY_ID!, secretAccessKey: process.env.R2_SECRET_ACCESS_KEY! } });
    let reservation: string | undefined;
    async function absent() {
      try { await s3.send(new HeadObjectCommand({ Bucket: storage!.bucket, Key: key })); }
      catch (error) { if (typeof error === "object" && error && "$metadata" in error && (error.$metadata as { httpStatusCode?: number }).httpStatusCode === 404) return; throw error; }
      throw new Error("Synthetic reserved object remains at origin.");
    }
    try {
      await db.user.create({ data: { id, username: id, email: `${id}@example.test`, displayName: "Disposable reservation fixture" } });
      reservation = await reserveMediaUpload(id, key, scopedTarget);
      expect((await db.mediaCleanup.findUniqueOrThrow({ where: { id: reservation } })).key).toBe(key);
      await absent();
      const body = await sharp({ create: { width: 256, height: 256, channels: 3, background: "#7830c4" } }).webp().toBuffer();
      const image = { key, body, contentType: "image/webp", bytes: body.length, width: 256, height: 256 };
      // Intentionally omit pointer adoption: models interruption after provider success.
      await putImage(image, scopedTarget);
      expect((await request.get(`${storage!.publicBase}/${key}`, { maxRedirects: 0 })).status()).toBe(200);
      expect(await processMediaCleanup(reservation, scopedTarget)).toBe(false);
      expect((await s3.send(new HeadObjectCommand({ Bucket: storage!.bucket, Key: key }))).ContentLength).toBe(body.length);
      await db.mediaCleanup.update({ where: { id: reservation }, data: { reservationExpiresAt: new Date(0), nextAttemptAt: new Date(0) } });
      for (let sweep = 0; sweep < 2; sweep++) {
        if (sweep) { await putImage(image, scopedTarget); await db.mediaCleanup.update({ where: { id: reservation }, data: { nextAttemptAt: new Date(0) } }); }
        expect(await runMediaCleanupBatch(scopedTarget)).toMatchObject({ swept: 1, retired: 0 });
        await absent();
        expect((await request.get(`${storage!.publicBase}/${key}`, { maxRedirects: 0 })).status()).toBe(404);
        expect((await db.mediaCleanup.findUniqueOrThrow({ where: { id: reservation } })).lastError).toBe("UPLOAD_ABANDONED");
      }
      expect((await db.user.findUniqueOrThrow({ where: { id } })).avatarKey).toBeNull();
    } finally {
      try {
        // Exact synthetic key only. Production recovery does not retire tombstones.
        await s3.send(new DeleteObjectCommand({ Bucket: storage!.bucket, Key: key }));
        await db.mediaCleanup.deleteMany({ where: { ...scopedTarget, key } });
        await db.mediaCleanupWorker.deleteMany({ where: { id: cleanupWorkerId(scopedTarget) } });
        await db.user.deleteMany({ where: { id, email: `${id}@example.test` } });
      } finally { s3.destroy(); await db.$disconnect(); }
    }
  });

});
