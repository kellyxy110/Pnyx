import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, mentionUsers } from "@/lib/discussion";
import { pageSchema, postSchema } from "@/lib/discussion-validation";

export async function GET(request: Request) {
  const url = new URL(request.url); const page = pageSchema.parse(url.searchParams.get("page") ?? 1); const limit = 12; const feed = url.searchParams.get("feed") ?? "latest"; const spaceSlug = url.searchParams.get("space"); const session = await auth();
  const blocked = session?.user?.id ? await prisma.userBlock.findMany({ where: { blockerId: session.user.id }, select: { blockedId: true } }) : [];
  const muted = session?.user?.id ? await prisma.spaceMute.findMany({ where: { userId: session.user.id }, select: { spaceId: true } }) : [];
  const following = feed === "following" && session?.user?.id ? await prisma.userFollow.findMany({ where: { followerId: session.user.id }, select: { followingId: true } }) : [];
  const posts = await prisma.post.findMany({ where: { isDeleted: false, isDraft: false, ...(spaceSlug ? { space: { slug: spaceSlug } } : {}), authorId: blocked.length ? { notIn: blocked.map((b) => b.blockedId) } : undefined, spaceId: muted.length ? { notIn: muted.map((m) => m.spaceId) } : undefined, ...(feed === "following" ? { authorId: { in: following.map((f) => f.followingId), ...(blocked.length ? { notIn: blocked.map((b) => b.blockedId) } : {}) } } : {}) }, include: { author: { select: { username: true, displayName: true, avatarUrl: true } }, space: { select: { slug: true, name: true } }, _count: { select: { replies: true, reactions: true, bookmarks: true } } }, orderBy: { createdAt: "desc" }, skip: (page - 1) * limit, take: limit });
  return NextResponse.json({ posts, page, hasMore: posts.length === limit });
}

export async function POST(request: Request) {
  const session = await auth(); if (!session?.user?.id) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const parsed = postSchema.safeParse(await request.json().catch(() => null)); if (!parsed.success) return NextResponse.json({ error: "Check the title, body, Space, and post options.", issues: parsed.error.flatten() }, { status: 400 });
  try { await checkRateLimit(session.user.id, "post"); } catch { return NextResponse.json({ error: "Posting limit reached. Try again in a minute." }, { status: 429 }); }
  const space = await prisma.space.findUnique({ where: { slug: parsed.data.spaceSlug }, select: { id: true, isPublic: true } }); if (!space?.isPublic) return NextResponse.json({ error: "Space not found." }, { status: 404 });
  const post = await prisma.post.create({ data: { authorId: session.user.id, spaceId: space.id, type: parsed.data.type, title: parsed.data.title, body: parsed.data.body, visibility: parsed.data.visibility, isDraft: parsed.data.isDraft, pollOptions: parsed.data.type === "POLL" ? parsed.data.pollOptions : undefined } });
  if (!parsed.data.isDraft) await mentionUsers(parsed.data.body, session.user.id, `/posts/${post.id}`);
  return NextResponse.json({ post }, { status: 201 });
}
