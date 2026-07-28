import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createToken } from "@/lib/tokens";
import { sendAccountMail } from "@/lib/mail";

const emailSchema = z.object({ email: z.string().trim().toLowerCase().email() });
const genericMessage = "If an unverified Pnyx account exists for that email, we sent a new verification link.";

export async function POST(request: Request) {
  const parsed = emailSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  const user = await prisma.user.findUnique({ where: { email: parsed.data.email }, select: { id: true, email: true, emailVerifiedAt: true } });
  if (!user || user.emailVerifiedAt) return NextResponse.json({ message: genericMessage });
  const token = createToken();
  await prisma.emailVerificationToken.deleteMany({ where: { userId: user.id } });
  await prisma.emailVerificationToken.create({ data: { tokenHash: token.hash, userId: user.id, expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) } });
  try {
    const appUrl = process.env.APP_URL?.replace(/\/$/, "");
    if (!appUrl) throw new Error("APP_URL_NOT_CONFIGURED");
    await sendAccountMail({ to: user.email, subject: "Verify your Pnyx email", html: `<p>Here is your new Pnyx verification link.</p><p><a href="${appUrl}/verify-email?token=${token.raw}">Verify your email address</a> within 24 hours.</p>` });
  } catch (error) {
    await prisma.emailVerificationToken.deleteMany({ where: { tokenHash: token.hash } });
    if (error instanceof Error && (error.message === "EMAIL_PROVIDER_NOT_CONFIGURED" || error.message === "APP_URL_NOT_CONFIGURED")) return NextResponse.json({ error: "Email verification is not configured yet. Please try again later." }, { status: 503 });
    return NextResponse.json({ error: "We could not deliver the verification email. Please try again later." }, { status: 503 });
  }
  return NextResponse.json({ message: genericMessage });
}