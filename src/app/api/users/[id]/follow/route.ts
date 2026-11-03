import { availablePersonWhere } from "@/lib/content-access";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { notify } from "@/lib/discussion";
import { prisma } from "@/lib/prisma";

export async function POST(_request: Request, context: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const { id } = await context.params;
  if (id === session.user.id) return NextResponse.json({ error: "You cannot follow yourself." }, { status: 400 });
  const target = await prisma.user.findFirst({ where: { id, profileVisibility: { not: "PRIVATE" }, AND: [availablePersonWhere(session.user.id)] }, select: { id: true, username: true, suspendedUntil: true } });
  if (!target || (target.suspendedUntil && target.suspendedUntil > new Date())) return NextResponse.json({ error: "This profile is unavailable." }, { status: 404 });
  const created = await prisma.userFollow.createMany({ data: { followerId: session.user.id, followingId: id }, skipDuplicates: true });
  if (created.count) {
    const actor = await prisma.user.findUnique({ where: { id: session.user.id }, select: { username: true } });
    await notify(id, "FOLLOW", "You have a new follower", "Someone followed your Pnyx profile.", actor ? `/people/${actor.username}` : undefined).catch(error => console.error("[follow] notification failed", { error: error instanceof Error ? error.message : "unknown" }));
  }
  const count = await prisma.userFollow.count({ where: { followingId: id } });
  return NextResponse.json({ following: true, followers: count });
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const { id } = await context.params;
  await prisma.userFollow.deleteMany({ where: { followerId: session.user.id, followingId: id } });
  const count = await prisma.userFollow.count({ where: { followingId: id } });
  return NextResponse.json({ following: false, followers: count });
}