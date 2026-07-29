ALTER TABLE "User"
  ADD COLUMN "avatarKey" TEXT,
  ADD COLUMN "avatarMetadata" JSONB,
  ADD COLUMN "bannerKey" TEXT,
  ADD COLUMN "bannerMetadata" JSONB,
  ADD COLUMN "headline" TEXT,
  ADD COLUMN "location" TEXT,
  ADD COLUMN "websiteUrl" TEXT,
  ADD COLUMN "githubUrl" TEXT,
  ADD COLUMN "linkedinUrl" TEXT,
  ADD COLUMN "skills" JSONB,
  ADD COLUMN "interests" JSONB;
