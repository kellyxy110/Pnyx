import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { ProductNav } from "@/components/product-nav";
import { PersonList } from "@/components/person-list";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function FollowersPage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const session = await auth();
  const user = await prisma.user.findUnique({ where: { username }, select: { id: true, username: true, displayName: true, profileVisibility: true } });
  if (!user) notFound();
  const isOwner = session?.user?.id === user.id;
  const isFollower = session?.user?.id ? await prisma.userFollow.findUnique({ where: { followerId_followingId: { followerId: session.user.id, followingId: user.id } }, select: { followerId: true } }) : null;
  if (user.profileVisibility === "PRIVATE" && !isOwner) notFound();
  if (user.profileVisibility === "FOLLOWERS_ONLY" && !isOwner && !isFollower) notFound();
  const followers = await prisma.userFollow.findMany({ where: { followingId: user.id }, include: { follower: { select: { username: true, displayName: true, avatarUrl: true, headline: true } } }, orderBy: { createdAt: "desc" } });
  return <main id="main-content" tabIndex={-1} className="app-shell"><ProductNav/><section className="public-profile"><p className="eyebrow"><Link href={`/people/${user.username}`}>← Back to {user.displayName}</Link></p><h1>Followers</h1><PersonList people={followers.map(({ follower }) => follower)} empty="No followers yet." /></section></main>;
}
