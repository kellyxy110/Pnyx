import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { spaceSchema } from "@/lib/account-validation";

export async function GET() {
  const session = await auth();
  const viewerId = session?.user?.id ?? "__anonymous__";
  const spaces = await prisma.space.findMany({ where: { isPublic: true }, orderBy: [{ isFeatured: "desc" }, { name: "asc" }], select: { id: true, slug: true, name: true, description: true, rules: true, tags: true, isFeatured: true, members: { where: { userId: viewerId }, select: { isModerator: true } }, followers: { where: { userId: viewerId }, select: { userId: true } }, _count: { select: { members: true, followers: true } } } });
  return NextResponse.json(spaces.map(({ members, followers, ...space }) => ({ ...space, viewer: { joined: members.length > 0, following: followers.length > 0, isModerator: members[0]?.isModerator ?? false } })));
}
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const actor = await prisma.user.findUnique({ where: { id: session.user.id }, select: { role: true } });
  if (!actor || !["ADMIN", "MODERATOR"].includes(actor.role)) return NextResponse.json({ error: "Only moderators can create Spaces." }, { status: 403 });
  const parsed = spaceSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Check the Space details and try again." }, { status: 400 });
  try {
    const space = await prisma.space.create({ data: parsed.data, select: { id: true, slug: true, name: true, description: true, tags: true } });
    return NextResponse.json(space, { status: 201 });
  } catch { return NextResponse.json({ error: "That Space slug is already in use." }, { status: 409 }); }
}
