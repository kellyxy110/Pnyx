import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createToken } from "@/lib/tokens";
import { sendAccountMail } from "@/lib/mail";

export async function POST(request: Request) {
  if (!process.env.RESEND_API_KEY || !process.env.EMAIL_FROM) return NextResponse.json({ error: "Password recovery is not configured yet." }, { status: 503 });
  const body = await request.json().catch(() => null) as { email?: string } | null;
  const email = body?.email?.trim().toLowerCase();
  if (!email) return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  const user = await prisma.user.findUnique({ where: { email } });
  if (user) {
    const token = createToken();
    await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });
    await prisma.passwordResetToken.create({ data: { tokenHash: token.hash, userId: user.id, expiresAt: new Date(Date.now() + 60 * 60 * 1000) } });
    await sendAccountMail({ to: user.email, subject: "Reset your Pnyx password", html: `<p>Reset your Pnyx password within one hour.</p><p><a href="${process.env.APP_URL}/reset-password?token=${token.raw}">Reset password</a></p>` });
  }
  return NextResponse.json({ message: "If an account matches that email, recovery instructions are on their way." });
}
