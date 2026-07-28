import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { profileSchema } from "@/lib/account-validation";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { id: true, email: true, username: true, displayName: true, avatarUrl: true, bio: true, timezone: true, expertise: true, links: true, profileVisibility: true, emailVerifiedAt: true } });
  return user ? NextResponse.json(user) : NextResponse.json({ error: "Account not found." }, { status: 404 });
}

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const parsed = profileSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Check the profile details and try again." }, { status: 400 });
  const user = await prisma.user.update({ where: { id: session.user.id }, data: parsed.data, select: { id: true, username: true, displayName: true, avatarUrl: true, bio: true, timezone: true, expertise: true, links: true, profileVisibility: true } });
  return NextResponse.json(user);
}
