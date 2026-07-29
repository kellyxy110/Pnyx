import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { profileSchema } from "@/lib/account-validation";
import { publicUrlForKey } from "@/lib/storage";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { id: true, email: true, username: true, displayName: true, avatarUrl: true, bannerKey: true, bio: true, headline: true, location: true, websiteUrl: true, githubUrl: true, linkedinUrl: true, timezone: true, expertise: true, skills: true, interests: true, links: true, profileVisibility: true, emailVerifiedAt: true, _count: { select: { posts: true, replies: true, artifacts: true, bookmarks: true, follows: true, followers: true, spaces: true } } } });
  if (!user) return NextResponse.json({ error: "Account not found." }, { status: 404 });
  const [spaces, posts, replies, artifacts, bookmarks, drafts] = await Promise.all([
    prisma.spaceMember.findMany({ where: { userId: user.id }, include: { space: { select: { name: true, slug: true } } }, orderBy: { joinedAt: "desc" }, take: 8 }),
    prisma.post.findMany({ where: { authorId: user.id, isDeleted: false, isDraft: false }, select: { id: true, title: true, createdAt: true }, orderBy: { createdAt: "desc" }, take: 6 }),
    prisma.reply.findMany({ where: { authorId: user.id, isDeleted: false }, select: { id: true, body: true, createdAt: true, post: { select: { id: true, title: true } } }, orderBy: { createdAt: "desc" }, take: 6 }),
    prisma.artifact.findMany({ where: { authorId: user.id }, select: { id: true, title: true, status: true, updatedAt: true }, orderBy: { updatedAt: "desc" }, take: 6 }),
    prisma.bookmark.findMany({ where: { userId: user.id }, select: { post: { select: { id: true, title: true } }, createdAt: true }, orderBy: { createdAt: "desc" }, take: 6 }),
    prisma.post.findMany({ where: { authorId: user.id, isDeleted: false, isDraft: true }, select: { id: true, title: true, updatedAt: true }, orderBy: { updatedAt: "desc" }, take: 6 }),
  ]);
  return NextResponse.json({ ...user, bannerUrl: publicUrlForKey(user.bannerKey), counts: user._count, activity: { spaces: spaces.map(({ space }) => space), posts, replies, artifacts, bookmarks, drafts } });
}

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const parsed = profileSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Check the profile details and try again." }, { status: 400 });
  const user = await prisma.user.update({ where: { id: session.user.id }, data: parsed.data, select: { id: true, username: true, displayName: true, avatarUrl: true, bannerKey: true, bio: true, headline: true, location: true, websiteUrl: true, githubUrl: true, linkedinUrl: true, timezone: true, expertise: true, skills: true, interests: true, links: true, profileVisibility: true } });
  return NextResponse.json(user);
}
