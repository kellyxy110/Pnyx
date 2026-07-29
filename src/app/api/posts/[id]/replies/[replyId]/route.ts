import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { replySchema } from "@/lib/discussion-validation";

async function canManageReply(userId: string, replyId: string) {
  const reply = await prisma.reply.findUnique({ where: { id: replyId }, select: { authorId: true, postId: true, post: { select: { spaceId: true } } } });
  if (!reply) return null;
  if (reply.authorId === userId) return reply;
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
  if (user?.role === "ADMIN" || user?.role === "MODERATOR") return reply;
  const member = await prisma.spaceMember.findUnique({ where: { userId_spaceId: { userId, spaceId: reply.post.spaceId } }, select: { isModerator: true } });
  return member?.isModerator ? reply : null;
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string; replyId: string }> }) {
  const session = await auth(); if (!session?.user?.id) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const { id, replyId } = await context.params; const reply = await canManageReply(session.user.id, replyId);
  if (!reply || reply.postId !== id) return NextResponse.json({ error: "You cannot edit this reply." }, { status: 403 });
  const parsed = replySchema.pick({ body: true }).safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Reply text is required.", issues: parsed.error.flatten() }, { status: 400 });
  const updated = await prisma.reply.update({ where: { id: replyId }, data: { body: parsed.data.body }, select: { id: true, body: true, updatedAt: true } });
  return NextResponse.json({ reply: updated });
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string; replyId: string }> }) {
  const session = await auth(); if (!session?.user?.id) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const { id, replyId } = await context.params; const reply = await canManageReply(session.user.id, replyId);
  if (!reply || reply.postId !== id) return NextResponse.json({ error: "You cannot delete this reply." }, { status: 403 });
  await prisma.reply.update({ where: { id: replyId }, data: { isDeleted: true, body: "This reply was removed by its author or a moderator." } });
  return NextResponse.json({ deleted: true });
}
