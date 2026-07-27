import type { Visibility } from "@prisma/client";

export type AccessContext = { userId?: string; followsAuthor?: boolean; isSpaceMember?: boolean; isModerator?: boolean };
export function canRead(visibility: Visibility, ownerId: string, context: AccessContext): boolean {
  if (visibility === "PUBLIC") return true;
  if (!context.userId) return false;
  if (context.userId === ownerId) return true;
  if (visibility === "FOLLOWERS_ONLY") return Boolean(context.followsAuthor);
  if (visibility === "SPACE_ONLY") return Boolean(context.isSpaceMember || context.isModerator);
  return false;
}
