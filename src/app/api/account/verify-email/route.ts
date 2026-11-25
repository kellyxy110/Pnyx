import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashToken } from "@/lib/tokens";
import { parseJson, recoveryTokenSchema } from "@/lib/recovery-validation";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = parseJson(body, recoveryTokenSchema);
  if (!parsed) return NextResponse.json({ error: "That verification link is invalid." }, { status: 400 });
  const record = await prisma.emailVerificationToken.findUnique({ where: { tokenHash: hashToken(parsed.token) } });
  if (!record || record.usedAt || record.expiresAt < new Date()) return NextResponse.json({ error: "That verification link is invalid or expired." }, { status: 400 });
  await prisma.$transaction([
    prisma.user.update({ where: { id: record.userId }, data: { emailVerifiedAt: new Date() } }),
    prisma.emailVerificationToken.update({ where: { tokenHash: record.tokenHash }, data: { usedAt: new Date() } }),
  ]);
  return NextResponse.json({ message: "Email verified. You can sign in now." });
}
