CREATE TABLE "MediaCleanupWorker" (
  "id" TEXT NOT NULL,
  "leaseToken" TEXT,
  "leaseUntil" TIMESTAMP(3) NOT NULL,
  "lastStartedAt" TIMESTAMP(3),
  "lastFinishedAt" TIMESTAMP(3),
  "lastStatus" TEXT,
  "lastSummary" JSONB,
  CONSTRAINT "MediaCleanupWorker_pkey" PRIMARY KEY ("id")
);
