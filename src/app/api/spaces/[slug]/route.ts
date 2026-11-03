import { readableSpaceWhere, readablePostWhere } from "@/lib/content-access";
import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_request: Request, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;
  const session = await auth();
  const space = await prisma.space.findFirst({ where: { slug, AND: [readableSpaceWhere(session?.user?.id)] }, select: { id: true, slug: true, name: true, description: true, rules: true, tags: true, isFeatured: true, createdAt: true, _count: { select: { members: true, followers: true, posts: { where: { isDraft: false, AND: [readablePostWhere(session?.user?.id)] } } } } } });
  return space ? NextResponse.json(space) : NextResponse.json({ error: "Space not found." }, { status: 404 });
}
