import { prisma } from "@/lib/prisma";
import { availablePersonWhere, readablePostWhere } from "@/lib/content-access";

export async function artifactSources(userId: string, postId?: string | null, replyId?: string | null) {
  const reply = replyId ? await prisma.reply.findFirst({ where: { id: replyId, isDeleted: false, author: availablePersonWhere(userId), post: readablePostWhere(userId) }, select: { id: true, postId: true } }) : null;
  if (replyId && !reply) return null;
  if (reply && postId && reply.postId !== postId) return null;
  const sourceId = postId ?? reply?.postId;
  const post = sourceId ? await prisma.post.findFirst({ where: { id: sourceId, isDraft: false, AND: [readablePostWhere(userId)] }, select: { id: true, visibility: true, space: { select: { isPublic: true } } } }) : null;
  if (sourceId && !post) return null;
  return { sourcePostId: post?.id ?? null, sourceReplyId: reply?.id ?? null, visibility: post && (post.visibility !== "PUBLIC" || !post.space.isPublic) ? "PRIVATE" as const : "PUBLIC" as const };
}
