import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(_request: Request, context: { params: Promise<{ slug: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const { slug } = await context.params;
  const space = await prisma.space.findUnique({ where: { slug }, select: { id: true, isPublic: true } });
  if (!space?.isPublic) return NextResponse.json({ error: "Space not found." }, { status: 404 });
  // An empty-update Prisma upsert can race between its read and insert.
  // PostgreSQL handles conflicts in the insert itself with skipDuplicates,
  // preserving existing membership (including moderator status).
  await prisma.spaceMember.createMany({ data: { userId: session.user.id, spaceId: space.id }, skipDuplicates: true });
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
  const [membership, members] = await prisma.$transaction([
    prisma.spaceMember.findUnique({ where: { userId_spaceId: { userId: session.user.id, spaceId: space.id } }, select: { userId: true } }),
    prisma.spaceMember.count({ where: { spaceId: space.id } }),
  ]);
  return NextResponse.json({ joined: Boolean(membership), members });
}
