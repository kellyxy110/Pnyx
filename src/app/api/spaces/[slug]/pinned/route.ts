import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: Request, context: { params: Promise<{ slug: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const { slug } = await context.params;
  const body = await request.json().catch(() => null) as { postId?: string; pinned?: boolean } | null;
  if (!body?.postId || typeof body.pinned !== "boolean") return NextResponse.json({ error: "Choose a discussion and pin state." }, { status: 400 });
  const space = await prisma.space.findUnique({ where: { slug }, select: { id: true } });
  if (!space) return NextResponse.json({ error: "Space not found." }, { status: 404 });
  const member = await prisma.spaceMember.findUnique({ where: { userId_spaceId: { userId: session.user.id, spaceId: space.id } }, select: { isModerator: true } });
  const user = member?.isModerator ? null : await prisma.user.findUnique({ where: { id: session.user.id }, select: { role: true } });
  if (!member?.isModerator && user?.role !== "ADMIN" && user?.role !== "MODERATOR") return NextResponse.json({ error: "Only Space moderators can pin discussions." }, { status: 403 });
  const post = await prisma.post.findFirst({ where: { id: body.postId, spaceId: space.id, isDeleted: false, isDraft: false }, select: { id: true } });
  if (!post) return NextResponse.json({ error: "Discussion not found in this Space." }, { status: 404 });
  await prisma.post.update({ where: { id: post.id }, data: { isPinned: body.pinned } });
  return NextResponse.json({ pinned: body.pinned });
}