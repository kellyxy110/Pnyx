ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "aiEnabled" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "AiOutput" ADD COLUMN IF NOT EXISTS "artifactId" TEXT;
ALTER TABLE "AiOutput" ADD COLUMN IF NOT EXISTS "requestedById" TEXT;
CREATE INDEX IF NOT EXISTS "AiOutput_artifactId_kind_idx" ON "AiOutput"("artifactId", "kind");
CREATE INDEX IF NOT EXISTS "AiOutput_requestedById_createdAt_idx" ON "AiOutput"("requestedById", "createdAt");
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'AiOutput_artifactId_fkey') THEN
    ALTER TABLE "AiOutput" ADD CONSTRAINT "AiOutput_artifactId_fkey" FOREIGN KEY ("artifactId") REFERENCES "Artifact"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'AiOutput_requestedById_fkey') THEN
    ALTER TABLE "AiOutput" ADD CONSTRAINT "AiOutput_requestedById_fkey" FOREIGN KEY ("requestedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
CREATE TABLE IF NOT EXISTS "AiFeedback" (
  "id" TEXT NOT NULL,
  "aiOutputId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "details" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AiFeedback_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "AiFeedback_aiOutputId_userId_key" ON "AiFeedback"("aiOutputId", "userId");
CREATE INDEX IF NOT EXISTS "AiFeedback_userId_createdAt_idx" ON "AiFeedback"("userId", "createdAt");
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'AiFeedback_aiOutputId_fkey') THEN
    ALTER TABLE "AiFeedback" ADD CONSTRAINT "AiFeedback_aiOutputId_fkey" FOREIGN KEY ("aiOutputId") REFERENCES "AiOutput"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'AiFeedback_userId_fkey') THEN
    ALTER TABLE "AiFeedback" ADD CONSTRAINT "AiFeedback_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;