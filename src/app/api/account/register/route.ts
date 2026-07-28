import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { registrationSchema } from "@/lib/account-validation";
import { createToken } from "@/lib/tokens";
import { sendAccountMail } from "@/lib/mail";

export async function POST(request: Request) {
  const parsed = registrationSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Check the account details and try again." }, { status: 400 });
  const input = parsed.data;
  const existing = await prisma.user.findFirst({ where: { OR: [{ email: input.email }, { username: input.username }] }, select: { email: true, username: true } });
  if (existing) return NextResponse.json({ error: existing.email === input.email ? "That email is already registered." : "That username is already in use." }, { status: 409 });
  const user = await prisma.user.create({ data: { email: input.email, username: input.username, displayName: input.displayName, passwordHash: await bcrypt.hash(input.password, 12) } });
  const token = createToken();
  await prisma.emailVerificationToken.create({ data: { tokenHash: token.hash, userId: user.id, expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) } });
  try {
    const url = `${process.env.APP_URL}/verify-email?token=${token.raw}`;
    await sendAccountMail({ to: user.email, subject: "Verify your Pnyx email", html: `<p>Welcome to Pnyx.</p><p><a href="${url}">Verify your email address</a> within 24 hours.</p>` });
  } catch (error) {
    await prisma.user.delete({ where: { id: user.id } });
    if (error instanceof Error && error.message === "EMAIL_PROVIDER_NOT_CONFIGURED") return NextResponse.json({ error: "Email delivery is not configured yet." }, { status: 503 });
    return NextResponse.json({ error: "We could not send the verification email." }, { status: 503 });
  }
  return NextResponse.json({ message: "Account created. Check your email to verify it before signing in." }, { status: 201 });
}
