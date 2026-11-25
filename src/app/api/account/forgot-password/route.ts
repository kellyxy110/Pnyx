import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createToken } from "@/lib/tokens";
import { sendAccountMail } from "@/lib/mail";
import { accountActionUrl } from "@/lib/app-url";
import { parseJson, recoveryEmailSchema } from "@/lib/recovery-validation";

export async function POST(request: Request) {
  if (!process.env.RESEND_API_KEY || !process.env.EMAIL_FROM || !accountActionUrl("reset-password?token=redacted")) return NextResponse.json({ error: "Password recovery is not configured yet." }, { status: 503 });
  const body = await request.json().catch(() => null);
  const parsed = parseJson(body, recoveryEmailSchema);
  if (!parsed) return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  const email = parsed.email;
  const user = await prisma.user.findUnique({ where: { email } });
  if (user) {
    const token = createToken();
    await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });
    await prisma.passwordResetToken.create({ data: { tokenHash: token.hash, userId: user.id, expiresAt: new Date(Date.now() + 60 * 60 * 1000) } });
    const url = accountActionUrl(`reset-password?token=${token.raw}`);
    if (!url) return NextResponse.json({ error: "Password recovery is not configured yet." }, { status: 503 });
    await sendAccountMail({ to: user.email, subject: "Reset your Pnyx password", html: `<p>Reset your Pnyx password within one hour.</p><p><a href="${url}">Reset password</a></p>` });
  }
  return NextResponse.json({ message: "If an account matches that email, recovery instructions are on their way." });
}
