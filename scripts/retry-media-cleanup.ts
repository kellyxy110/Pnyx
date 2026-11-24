import { verificationTarget, storageVerificationTarget } from "../src/lib/disposable-verification";
import { prisma } from "../src/lib/prisma";
import { processMediaCleanup } from "../src/lib/media-cleanup";

// This command is intentionally unavailable for production or hosted databases.
verificationTarget(process.env);
if (!storageVerificationTarget(process.env)) throw new Error("Dedicated R2 cleanup opt-in is required.");
if (process.argv.slice(2).length) throw new Error("Cleanup command takes no arguments.");
async function main() {
  try {
    const jobs = await prisma.mediaCleanup.findMany({ where: { nextAttemptAt: { lte: new Date() } }, orderBy: { nextAttemptAt: "asc" }, take: 25, select: { id: true } });
    let completed = 0;
    for (const job of jobs) if (await processMediaCleanup(job.id)) completed++;
    const pending = await prisma.mediaCleanup.count();
    console.log(JSON.stringify({ attempted: jobs.length, completed, pending }));
    if (pending) process.exitCode = 1;
  } finally { await prisma.$disconnect(); }
}
void main().catch(() => { console.error("Isolated media cleanup did not complete; inspect durable receipts privately."); process.exitCode = 1; });
