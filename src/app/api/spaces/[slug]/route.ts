import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_request: Request, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;
  const space = await prisma.space.findUnique({ where: { slug }, select: { id: true, slug: true, name: true, description: true, rules: true, tags: true, isFeatured: true, createdAt: true, _count: { select: { members: true, followers: true, posts: true } } } });
  return space ? NextResponse.json(space) : NextResponse.json({ error: "Space not found." }, { status: 404 });
}
