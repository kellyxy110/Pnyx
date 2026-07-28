ALTER TABLE "Artifact" ADD COLUMN IF NOT EXISTS "publishedAt" TIMESTAMP(3);
ALTER TABLE "ArtifactRevision" ADD COLUMN IF NOT EXISTS "changeSummary" TEXT;
ALTER TABLE "Source" ADD COLUMN IF NOT EXISTS "citation" TEXT;

CREATE TABLE IF NOT EXISTS "ArtifactContributor" (
  "artifactId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "role" TEXT NOT NULL DEFAULT 'CONTRIBUTOR',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ArtifactContributor_pkey" PRIMARY KEY ("artifactId", "userId")
);

CREATE TABLE IF NOT EXISTS "ArtifactReport" (
  "id" TEXT NOT NULL,
  "artifactId" TEXT NOT NULL,
  "reporterId" TEXT NOT NULL,
  "reason" TEXT NOT NULL,
  "details" TEXT,
  "status" "ReportStatus" NOT NULL DEFAULT 'OPEN',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ArtifactReport_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "ArtifactContributor_userId_createdAt_idx" ON "ArtifactContributor"("userId", "createdAt");
CREATE INDEX IF NOT EXISTS "ArtifactReport_artifactId_status_createdAt_idx" ON "ArtifactReport"("artifactId", "status", "createdAt");
CREATE INDEX IF NOT EXISTS "ArtifactReport_reporterId_createdAt_idx" ON "ArtifactReport"("reporterId", "createdAt");

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ArtifactContributor_artifactId_fkey') THEN
    ALTER TABLE "ArtifactContributor" ADD CONSTRAINT "ArtifactContributor_artifactId_fkey" FOREIGN KEY ("artifactId") REFERENCES "Artifact"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ArtifactContributor_userId_fkey') THEN
    ALTER TABLE "ArtifactContributor" ADD CONSTRAINT "ArtifactContributor_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ArtifactReport_artifactId_fkey') THEN
    ALTER TABLE "ArtifactReport" ADD CONSTRAINT "ArtifactReport_artifactId_fkey" FOREIGN KEY ("artifactId") REFERENCES "Artifact"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ArtifactReport_reporterId_fkey') THEN
    ALTER TABLE "ArtifactReport" ADD CONSTRAINT "ArtifactReport_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
