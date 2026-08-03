ALTER TABLE "Post" ADD COLUMN "isPinned" BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX "Post_spaceId_isPinned_createdAt_idx" ON "Post"("spaceId", "isPinned", "createdAt");