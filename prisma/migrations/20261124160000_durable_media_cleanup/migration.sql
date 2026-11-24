CREATE TABLE "MediaCleanup" (
  "id" TEXT NOT NULL,
  "endpoint" TEXT NOT NULL,
  "bucket" TEXT NOT NULL,
  "key" TEXT NOT NULL,
  "attempts" INTEGER NOT NULL DEFAULT 0,
  "lastError" TEXT,
  "nextAttemptAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "MediaCleanup_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "MediaCleanup_endpoint_bucket_key_key" ON "MediaCleanup"("endpoint", "bucket", "key");
CREATE INDEX "MediaCleanup_nextAttemptAt_idx" ON "MediaCleanup"("nextAttemptAt");
