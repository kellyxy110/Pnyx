import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const passwordSchema = z.object({ currentPassword: z.string().max(128).optional(), password: z.string().min(12).max(128), confirmPassword: z.string().min(12).max(128) }).refine((value) => value.password === value.confirmPassword, { path: ["confirmPassword"], message: "Passwords do not match." });

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const parsed = passwordSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Choose a password with at least 12 characters and make sure both fields match." }, { status: 400 });
  const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { id: true, passwordHash: true, emailVerifiedAt: true, suspendedUntil: true } });
  if (!user || !user.emailVerifiedAt) return NextResponse.json({ error: "Your account must have a verified email before a password can be set." }, { status: 403 });
  if (user.suspendedUntil && user.suspendedUntil > new Date()) return NextResponse.json({ error: "This account is temporarily unavailable." }, { status: 403 });
  if (user.passwordHash && (!parsed.data.currentPassword || !(await bcrypt.compare(parsed.data.currentPassword, user.passwordHash)))) return NextResponse.json({ error: "Your current password is incorrect." }, { status: 400 });
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash: await bcrypt.hash(parsed.data.password, 12) } });
  return NextResponse.json({ message: user.passwordHash ? "Password updated." : "Password created. You can now sign in with your email and password." });
}
