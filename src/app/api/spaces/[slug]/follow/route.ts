import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(_request: Request, context: { params: Promise<{ slug: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const { slug } = await context.params;
  const space = await prisma.space.findUnique({ where: { slug }, select: { id: true } });
  if (!space) return NextResponse.json({ error: "Space not found." }, { status: 404 });
  await prisma.spaceFollow.upsert({ where: { userId_spaceId: { userId: session.user.id, spaceId: space.id } }, update: {}, create: { userId: session.user.id, spaceId: space.id } });
  return NextResponse.json({ following: true });
}

export async function DELETE(_request: Request, context: { params: Promise<{ slug: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const { slug } = await context.params;
  const space = await prisma.space.findUnique({ where: { slug }, select: { id: true } });
  if (!space) return NextResponse.json({ error: "Space not found." }, { status: 404 });
  await prisma.spaceFollow.deleteMany({ where: { userId: session.user.id, spaceId: space.id } });
  return NextResponse.json({ following: false });
}
