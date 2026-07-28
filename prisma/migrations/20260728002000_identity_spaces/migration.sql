ALTER TABLE "User" ADD COLUMN "timezone" TEXT, ADD COLUMN "expertise" JSONB, ADD COLUMN "links" JSONB, ADD COLUMN "passwordHash" TEXT, ADD COLUMN "emailVerifiedAt" TIMESTAMP(3), ADD COLUMN "profileVisibility" "Visibility" NOT NULL DEFAULT 'PUBLIC';
ALTER TABLE "Space" ADD COLUMN "tags" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[], ADD COLUMN "isFeatured" BOOLEAN NOT NULL DEFAULT false;

CREATE TABLE "SpaceFollow" ("userId" TEXT NOT NULL, "spaceId" TEXT NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "SpaceFollow_pkey" PRIMARY KEY ("userId","spaceId"));
CREATE TABLE "PasswordResetToken" ("tokenHash" TEXT NOT NULL, "userId" TEXT NOT NULL, "expiresAt" TIMESTAMP(3) NOT NULL, "usedAt" TIMESTAMP(3), "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY ("tokenHash"));
CREATE TABLE "EmailVerificationToken" ("tokenHash" TEXT NOT NULL, "userId" TEXT NOT NULL, "expiresAt" TIMESTAMP(3) NOT NULL, "usedAt" TIMESTAMP(3), "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "EmailVerificationToken_pkey" PRIMARY KEY ("tokenHash"));

CREATE INDEX "SpaceFollow_spaceId_createdAt_idx" ON "SpaceFollow"("spaceId", "createdAt");
CREATE INDEX "PasswordResetToken_userId_expiresAt_idx" ON "PasswordResetToken"("userId", "expiresAt");
CREATE INDEX "EmailVerificationToken_userId_expiresAt_idx" ON "EmailVerificationToken"("userId", "expiresAt");

ALTER TABLE "SpaceFollow" ADD CONSTRAINT "SpaceFollow_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SpaceFollow" ADD CONSTRAINT "SpaceFollow_spaceId_fkey" FOREIGN KEY ("spaceId") REFERENCES "Space"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PasswordResetToken" ADD CONSTRAINT "PasswordResetToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "EmailVerificationToken" ADD CONSTRAINT "EmailVerificationToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
