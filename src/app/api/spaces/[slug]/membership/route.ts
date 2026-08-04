import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(_request: Request, context: { params: Promise<{ slug: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const { slug } = await context.params;
  const space = await prisma.space.findUnique({ where: { slug }, select: { id: true, isPublic: true } });
  if (!space?.isPublic) return NextResponse.json({ error: "Space not found." }, { status: 404 });
  // Idempotent by construction: the composite (userId, spaceId) primary key
  // makes this an atomic INSERT ... ON CONFLICT DO NOTHING under concurrent
  // requests, so at most one membership row can ever exist per user/Space.
  await prisma.spaceMember.upsert({ where: { userId_spaceId: { userId: session.user.id, spaceId: space.id } }, update: {}, create: { userId: session.user.id, spaceId: space.id } });
  const members = await prisma.spaceMember.count({ where: { spaceId: space.id } });
  return NextResponse.json({ joined: true, members });
}

export async function DELETE(_request: Request, context: { params: Promise<{ slug: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const { slug } = await context.params;
  const space = await prisma.space.findUnique({ where: { slug }, select: { id: true } });
  if (!space) return NextResponse.json({ error: "Space not found." }, { status: 404 });
  await prisma.spaceMember.deleteMany({ where: { userId: session.user.id, spaceId: space.id, isModerator: false } });
  const members = await prisma.spaceMember.count({ where: { spaceId: space.id } });
  return NextResponse.json({ joined: false, members });
}
