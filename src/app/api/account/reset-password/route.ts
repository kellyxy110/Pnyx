import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashToken } from "@/lib/tokens";
import { parseJson, resetPasswordSchema } from "@/lib/recovery-validation";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = parseJson(body, resetPasswordSchema);
  if (!parsed) return NextResponse.json({ error: "The reset link or password is invalid." }, { status: 400 });
  const record = await prisma.passwordResetToken.findUnique({ where: { tokenHash: hashToken(parsed.token) } });
  if (!record || record.usedAt || record.expiresAt < new Date()) return NextResponse.json({ error: "That reset link is invalid or expired." }, { status: 400 });
  await prisma.$transaction([
    prisma.user.update({ where: { id: record.userId }, data: { passwordHash: await bcrypt.hash(parsed.password, 12) } }),
    prisma.passwordResetToken.update({ where: { tokenHash: record.tokenHash }, data: { usedAt: new Date() } }),
  ]);
  return NextResponse.json({ message: "Password updated. You can sign in now." });
}
