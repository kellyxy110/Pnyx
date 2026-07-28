import { prisma } from "@/lib/prisma";
export async function canEditArtifact(userId: string, artifactId: string) {
  const artifact = await prisma.artifact.findUnique({ where: { id: artifactId }, select: { authorId: true, spaceId: true } });
  if (!artifact) return false;
  if (artifact.authorId === userId) return true;
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
  if (user?.role === "ADMIN") return true;
  const member = await prisma.spaceMember.findUnique({ where: { userId_spaceId: { userId, spaceId: artifact.spaceId } }, select: { isModerator: true } });
  return Boolean(member?.isModerator || user?.role === "MODERATOR");
}
export async function recordKnowledgeMetric(name: string, userId: string | undefined, artifactId: string, path?: string) {
  await prisma.analyticsEvent.create({ data: { name, anonymousId: userId ?? "authenticated-artifact", userId, path, properties: { artifactId } } });
}
