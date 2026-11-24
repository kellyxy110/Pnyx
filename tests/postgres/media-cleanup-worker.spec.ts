import { randomUUID } from "node:crypto";
import { PrismaClient } from "@prisma/client";
import { expect, request, test } from "@playwright/test";
import { assertVerifiedApplication } from "../support/verified-application";
import { verificationTarget } from "./target";
import { cleanupWorkerId, cleanupWorkerStatus, runMediaCleanupBatch, CLEANUP_BATCH_SIZE } from "../../src/lib/media-cleanup-worker";

const { app } = verificationTarget(process.env), db = new PrismaClient();
const prefix = `worker-${randomUUID()}`, target = { endpoint: "https://fixture.r2.cloudflarestorage.com", bucket: `pnyx-e2e-${prefix}` };
let verified = false;
test.beforeAll(async () => { const client = await request.newContext({ baseURL: app.origin }); try { await assertVerifiedApplication(client); verified = true; } finally { await client.dispose(); } });
test.afterEach(async () => { if (verified) { await db.mediaCleanup.deleteMany({ where: { endpoint: target.endpoint, bucket: target.bucket } }); await db.mediaCleanupWorker.deleteMany({ where: { id: cleanupWorkerId(target) } }); } });
test.afterAll(async () => { await db.$disconnect(); });
async function job() { return db.mediaCleanup.create({ data: { ...target, key: `users/${prefix}/avatar/${randomUUID()}.webp` } }); }

test("idle scheduled batch records a healthy heartbeat without provider calls", async () => {
  let calls = 0; const report = await runMediaCleanupBatch(target, async () => { calls++; });
  expect(report).toMatchObject({ state: "ok", selected: 0, retired: 0, swept: 0 }); expect(calls).toBe(0);
  expect(await cleanupWorkerStatus(target)).toMatchObject({ state: "ok", stale: false, pending: 0 });
});

test("provider failure persists actionable status and preserves receipt/backoff", async () => {
  const receipt = await job();
  const report = await runMediaCleanupBatch(target, async () => { throw new Error("private synthetic provider detail"); });
  expect(report).toMatchObject({ state: "attention", retired: 0, failed: 1, pending: 1 });
  expect(JSON.stringify(report)).not.toContain(receipt.key);
  const row = await db.mediaCleanup.findUniqueOrThrow({ where: { id: receipt.id } }); expect(row.lastError).toBe("PROVIDER_DELETE_FAILED"); expect(row.nextAttemptAt.getTime()).toBeGreaterThan(Date.now());
  expect(await cleanupWorkerStatus(target)).toMatchObject({ state: "attention", failed: 1 });
});

test("scheduled batches bound work and drain the remainder on the next invocation", async () => {
  for (let i = 0; i < CLEANUP_BATCH_SIZE + 2; i++) await job();
  expect(await runMediaCleanupBatch(target, async () => undefined)).toMatchObject({ selected: CLEANUP_BATCH_SIZE, retired: CLEANUP_BATCH_SIZE, pending: 2 });
  expect(await runMediaCleanupBatch(target, async () => undefined)).toMatchObject({ retired: 2, pending: 0, state: "ok" });
});

test("overlapping scheduled requests have one durable lease owner", async () => {
  await job();
  let entered!: () => void, release!: () => void;
  const ready = new Promise<void>(resolve => { entered = resolve; }), gate = new Promise<void>(resolve => { release = resolve; });
  const first = runMediaCleanupBatch(target, async () => { entered(); await gate; });
  try { await ready; expect(await runMediaCleanupBatch(target, async () => { throw new Error("Second worker must not delete"); })).toEqual({ state: "busy" }); }
  finally { release(); }
  expect(await first).toMatchObject({ retired: 1, state: "ok" });
});

test("expired process lease is recoverable and missing heartbeat is unhealthy", async () => {
  expect(await cleanupWorkerStatus(target)).toMatchObject({ state: "attention", stale: true });
  await db.mediaCleanupWorker.create({ data: { id: cleanupWorkerId(target), leaseToken: "synthetic-crashed-process", leaseUntil: new Date(0), lastStartedAt: new Date(0) } });
  expect(await runMediaCleanupBatch(target, async () => undefined)).toMatchObject({ state: "ok" });
  const row = await db.mediaCleanupWorker.findUniqueOrThrow({ where: { id: cleanupWorkerId(target) } }); expect(row.leaseToken).toBeNull();
  await db.mediaCleanupWorker.update({ where: { id: row.id }, data: { lastFinishedAt: new Date(0) } });
  expect(await cleanupWorkerStatus(target)).toMatchObject({ state: "attention", stale: true });
});

test("old abandoned tombstones trigger review and are retained after a successful sweep", async () => {
  const receipt = await job();
  await db.mediaCleanup.update({ where: { id: receipt.id }, data: { reservationExpiresAt: new Date(0), createdAt: new Date(Date.now() - 31 * 24 * 60 * 60_000) } });
  expect(await runMediaCleanupBatch(target, async () => undefined)).toMatchObject({ state: "attention", swept: 1, retired: 0, reviewRequired: 1 });
  expect((await db.mediaCleanup.findUniqueOrThrow({ where: { id: receipt.id } })).lastError).toBe("UPLOAD_ABANDONED");
  expect(await cleanupWorkerStatus(target)).toMatchObject({ state: "attention", reviewRequired: 1, abandoned: 1 });
});

test("live upload leases are excluded from scheduled deletion", async () => {
  const receipt = await job(); await db.mediaCleanup.update({ where: { id: receipt.id }, data: { reservationExpiresAt: new Date(Date.now() + 60_000) } });
  let calls = 0; expect(await runMediaCleanupBatch(target, async () => { calls++; })).toMatchObject({ selected: 0, pending: 1, state: "ok" }); expect(calls).toBe(0);
});

test("wrong-target receipts are counted for attention without provider deletion", async () => {
  const receipt = await job(), foreign = { ...target, bucket: `${target.bucket}-other` };
  let calls = 0; expect(await runMediaCleanupBatch(foreign, async () => { calls++; })).toMatchObject({ state: "attention", foreignTarget: 1, selected: 0 }); expect(calls).toBe(0);
  expect(await db.mediaCleanup.findUnique({ where: { id: receipt.id } })).not.toBeNull();
  await db.mediaCleanupWorker.deleteMany({ where: { id: cleanupWorkerId(foreign) } });
});

test("a displaced lease owner cannot continue a batch or overwrite its successor heartbeat", async () => {
  await job(); await job(); let calls = 0;
  const report = await runMediaCleanupBatch(target, async () => {
    calls++;
    await db.mediaCleanupWorker.update({ where: { id: cleanupWorkerId(target) }, data: { leaseToken: "synthetic-successor", leaseUntil: new Date(Date.now() + 60_000), lastStatus: "successor" } });
  });
  expect(report).toEqual({ state: "busy" }); expect(calls).toBe(1);
  expect((await db.mediaCleanupWorker.findUniqueOrThrow({ where: { id: cleanupWorkerId(target) } })).lastStatus).toBe("successor");
  expect(await db.mediaCleanup.count({ where: target })).toBe(1);
});

test("running application exposes no cleanup or status operations without explicit activation", async ({ request: client }) => {
  for (const path of ["/api/internal/media-cleanup", "/api/internal/media-cleanup/status"]) {
    const response = await client.get(path); expect(response.status()).toBe(404); expect(response.headers()["cache-control"]).toContain("no-store");
  }
  expect((await client.post("/api/internal/media-cleanup")).status()).toBe(404);
});
