ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "suspendedUntil" TIMESTAMP(3);
CREATE TABLE IF NOT EXISTS "ModerationAppeal" (
  "id" TEXT NOT NULL,
  "appellantId" TEXT NOT NULL,
  "reportId" TEXT,
  "artifactReportId" TEXT,
  "reason" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'OPEN',
  "reviewerId" TEXT,
  "resolution" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ModerationAppeal_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "ModerationAppeal_status_createdAt_idx" ON "ModerationAppeal"("status", "createdAt");
CREATE INDEX IF NOT EXISTS "ModerationAppeal_appellantId_createdAt_idx" ON "ModerationAppeal"("appellantId", "createdAt");
DO $$ BEGIN
 IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='ModerationAppeal_appellantId_fkey') THEN ALTER TABLE "ModerationAppeal" ADD CONSTRAINT "ModerationAppeal_appellantId_fkey" FOREIGN KEY ("appellantId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE; END IF;
 IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='ModerationAppeal_reviewerId_fkey') THEN ALTER TABLE "ModerationAppeal" ADD CONSTRAINT "ModerationAppeal_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE; END IF;
 IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='ModerationAppeal_reportId_fkey') THEN ALTER TABLE "ModerationAppeal" ADD CONSTRAINT "ModerationAppeal_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "Report"("id") ON DELETE CASCADE ON UPDATE CASCADE; END IF;
 IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='ModerationAppeal_artifactReportId_fkey') THEN ALTER TABLE "ModerationAppeal" ADD CONSTRAINT "ModerationAppeal_artifactReportId_fkey" FOREIGN KEY ("artifactReportId") REFERENCES "ArtifactReport"("id") ON DELETE CASCADE ON UPDATE CASCADE; END IF;
END $$;