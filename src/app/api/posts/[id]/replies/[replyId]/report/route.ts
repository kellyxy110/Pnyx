import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { reportSchema } from "@/lib/discussion-validation";
import { moderationRateLimit } from "@/lib/moderation";

export async function POST(request: Request, context: { params: Promise<{ id: string; replyId: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  try { await moderationRateLimit(session.user.id, "report"); } catch { return NextResponse.json({ error: "Report limit reached. Try again later." }, { status: 429 }); }
  const parsed = reportSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Choose a report reason." }, { status: 400 });
  const { id, replyId } = await context.params;
  const reply = await prisma.reply.findFirst({ where: { id: replyId, postId: id, isDeleted: false }, select: { id: true, authorId: true } });
  if (!reply) return NextResponse.json({ error: "Reply not found." }, { status: 404 });
  if (reply.authorId === session.user.id) return NextResponse.json({ error: "You cannot report your own reply." }, { status: 400 });
  await prisma.report.create({ data: { reporterId: session.user.id, postId: id, replyId, reason: parsed.data.reason, details: parsed.data.details } });
  return NextResponse.json({ reported: true }, { status: 201 });
}