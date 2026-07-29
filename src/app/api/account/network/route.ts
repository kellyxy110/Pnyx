import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const [followers, following] = await Promise.all([
    prisma.userFollow.findMany({ where: { followingId: session.user.id }, include: { follower: { select: { username: true, displayName: true, avatarUrl: true } } }, orderBy: { createdAt: "desc" }, take: 30 }),
    prisma.userFollow.findMany({ where: { followerId: session.user.id }, include: { following: { select: { username: true, displayName: true, avatarUrl: true } } }, orderBy: { createdAt: "desc" }, take: 30 }),
  ]);
  return NextResponse.json({ followers: followers.map(({ follower }) => follower), following: following.map(({ following }) => following) });
}