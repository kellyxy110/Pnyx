import { createHash, randomUUID } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { processMediaCleanupDetailed } from "@/lib/media-cleanup";
import { deleteObject, type StorageTarget } from "@/lib/storage";

export const CLEANUP_BATCH_SIZE = 5;
export const CLEANUP_LEASE_MS = 5 * 60_000;
export const CLEANUP_STALE_MS = 15 * 60_000;
export const CLEANUP_REVIEW_MS = 30 * 24 * 60 * 60_000;
const failures = ["STORAGE_TARGET_UNAVAILABLE", "OBJECT_STILL_REFERENCED", "PROVIDER_DELETE_FAILED"];
export function cleanupWorkerId(target: StorageTarget) {
  return createHash("sha256").update(JSON.stringify([target.endpoint, target.bucket])).digest("hex");
}

export async function cleanupMetrics(target: StorageTarget, now = new Date()) {
  const dueWhere = { ...target, nextAttemptAt: { lte: now }, OR: [{ reservationExpiresAt: null }, { reservationExpiresAt: { lte: now } }] };
  const [pending, due, failed, abandoned, reviewRequired, foreignTarget, oldest] = await Promise.all([
    prisma.mediaCleanup.count({ where: target }),
    prisma.mediaCleanup.count({ where: dueWhere }),
    prisma.mediaCleanup.count({ where: { ...target, lastError: { in: failures } } }),
    prisma.mediaCleanup.count({ where: { ...target, lastError: "UPLOAD_ABANDONED" } }),
    prisma.mediaCleanup.count({ where: { ...target, reservationExpiresAt: { not: null }, createdAt: { lte: new Date(now.getTime() - CLEANUP_REVIEW_MS) } } }),
    prisma.mediaCleanup.count({ where: { NOT: target } }),
    prisma.mediaCleanup.findFirst({ where: dueWhere, orderBy: { nextAttemptAt: "asc" }, select: { nextAttemptAt: true } }),
  ]);
  return { pending, due, failed, abandoned, reviewRequired, foreignTarget, overdue: Boolean(oldest && now.getTime() - oldest.nextAttemptAt.getTime() >= CLEANUP_STALE_MS) };
}

export async function cleanupWorkerStatus(target: StorageTarget) {
  const [worker, metrics] = await Promise.all([prisma.mediaCleanupWorker.findUnique({ where: { id: cleanupWorkerId(target) } }), cleanupMetrics(target)]);
  const stale = !worker?.lastFinishedAt || Date.now() - worker.lastFinishedAt.getTime() >= CLEANUP_STALE_MS;
  const attention = stale || (worker?.lastStatus === "error" || worker?.lastStatus === "attention") || metrics.failed > 0 || metrics.reviewRequired > 0 || metrics.foreignTarget > 0 || metrics.overdue;
  return { state: attention ? "attention" : "ok", stale, lastStartedAt: worker?.lastStartedAt ?? null, lastFinishedAt: worker?.lastFinishedAt ?? null, ...metrics };
}

/** Bounded singleton batch; no object keys, target identifiers or secrets in reports. */
export async function runMediaCleanupBatch(target: StorageTarget, remove: (key: string, target: StorageTarget) => Promise<void> = deleteObject) {
  const id = cleanupWorkerId(target), token = randomUUID(), now = new Date();
  await prisma.mediaCleanupWorker.upsert({ where: { id }, create: { id, leaseUntil: new Date(0) }, update: {} });
  const claimed = await prisma.mediaCleanupWorker.updateMany({ where: { id, leaseUntil: { lte: now } }, data: { leaseToken: token, leaseUntil: new Date(now.getTime() + CLEANUP_LEASE_MS), lastStartedAt: now } });
  if (!claimed.count) return { state: "busy" } as const;
  let retired = 0, swept = 0, errors = 0;
  try {
    const jobs = await prisma.mediaCleanup.findMany({ where: { ...target, nextAttemptAt: { lte: now }, OR: [{ reservationExpiresAt: null }, { reservationExpiresAt: { lte: now } }] }, orderBy: [{ nextAttemptAt: "asc" }, { id: "asc" }], take: CLEANUP_BATCH_SIZE, select: { id: true } });
    for (const job of jobs) {
      const heartbeat = new Date();
      const owned = await prisma.mediaCleanupWorker.updateMany({ where: { id, leaseToken: token, leaseUntil: { gt: heartbeat } }, data: { leaseUntil: new Date(heartbeat.getTime() + CLEANUP_LEASE_MS) } });
      if (!owned.count) return { state: "busy" } as const;
      try {
        const outcome = await processMediaCleanupDetailed(job.id, target, remove);
        if (outcome === "retired") retired++;
        if (outcome === "swept") swept++;
      } catch { errors++; }
    }
    const metrics = await cleanupMetrics(target);
    const state = errors || metrics.failed || metrics.reviewRequired || metrics.foreignTarget || metrics.overdue ? "attention" : "ok";
    const report = { state, selected: jobs.length, retired, swept, errors, ...metrics };
    const finished = await prisma.mediaCleanupWorker.updateMany({ where: { id, leaseToken: token, leaseUntil: { gt: new Date() } }, data: { leaseToken: null, leaseUntil: new Date(0), lastFinishedAt: new Date(), lastStatus: state, lastSummary: report } });
    if (!finished.count) return { state: "busy" } as const;
    if (state === "attention") console.error("[media-cleanup] attention", report);
    return report;
  } catch {
    await prisma.mediaCleanupWorker.updateMany({ where: { id, leaseToken: token }, data: { leaseToken: null, leaseUntil: new Date(0), lastFinishedAt: new Date(), lastStatus: "error", lastSummary: { state: "error" } } }).catch(() => undefined);
    console.error("[media-cleanup] worker failed");
    throw new Error("Media cleanup worker unavailable.");
  }
}
