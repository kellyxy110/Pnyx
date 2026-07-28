import type { PostType, Visibility } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function requirePost(id: string) {
  return prisma.post.findUnique({ where: { id }, include: { author: true, space: true } });
}
export async function canModerate(userId: string, postId: string) {
  const post = await prisma.post.findUnique({ where: { id: postId }, select: { authorId: true, spaceId: true } });
  if (!post) return false;
  if (post.authorId === userId) return true;
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
  if (user?.role === "ADMIN") return true;
  const member = await prisma.spaceMember.findUnique({ where: { userId_spaceId: { userId, spaceId: post.spaceId } }, select: { isModerator: true } });
  return Boolean(member?.isModerator || user?.role === "MODERATOR");
}
export async function checkRateLimit(userId: string, kind: "post" | "reply") {
  const since = new Date(Date.now() - 60_000);
  const count = kind === "post" ? await prisma.post.count({ where: { authorId: userId, createdAt: { gte: since } } }) : await prisma.reply.count({ where: { authorId: userId, createdAt: { gte: since } } });
  if (count >= (kind === "post" ? 5 : 20)) throw new Error("RATE_LIMIT");
}
export async function notify(userId: string, type: string, title: string, body: string, href?: string) {
  if (!userId) return;
  await prisma.notification.create({ data: { userId, type, title, body, href } });
}
export async function mentionUsers(text: string, actorId: string, href: string) {
  const names = [...text.matchAll(/@([a-zA-Z0-9_]{2,30})/g)].map((m) => m[1].toLowerCase());
  const users = names.length ? await prisma.user.findMany({ where: { username: { in: names }, NOT: { id: actorId } }, select: { id: true, username: true } }) : [];
  await Promise.all(users.map((u) => notify(u.id, "MENTION", "You were mentioned", `@${u.username} was mentioned in a discussion.`, href)));
}
export type PostInput = { authorId: string; spaceId: string; type: PostType; title: string; body: string; visibility: Visibility; isDraft: boolean; pollOptions?: string[] };
