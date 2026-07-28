import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { canEditArtifact } from "@/lib/knowledge";
import { generateAi } from "@/lib/ai";
import { saveAiOutput } from "@/lib/ai-persistence";
export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const session = await auth(); if (!session?.user?.id) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const { id } = await context.params; if (!(await canEditArtifact(session.user.id, id))) return NextResponse.json({ error: "You cannot draft this artifact." }, { status: 403 });
  const preference = await prisma.user.findUnique({ where: { id: session.user.id }, select: { aiEnabled: true } }); if (!preference?.aiEnabled) return NextResponse.json({ error: "AI assistance is disabled in your preferences." }, { status: 403 });
  const input = await request.json().catch(() => null) as { postId?: string; replyIds?: string[] } | null; const artifact = await prisma.artifact.findUnique({ where: { id }, select: { sourcePostId: true, sourceReplyId: true } });
  const postId = input?.postId ?? artifact?.sourcePostId; if (!postId) return NextResponse.json({ error: "Select a source discussion before drafting." }, { status: 400 });
  const post = await prisma.post.findUnique({ where: { id: postId, isDeleted: false, isDraft: false, visibility: "PUBLIC" }, select: { id: true, title: true, body: true, replies: { where: { id: { in: input?.replyIds ?? [] }, isDeleted: false }, select: { id: true, body: true }, orderBy: { createdAt: "asc" } } } });
  if (!post) return NextResponse.json({ error: "Selected public discussion not found." }, { status: 404 });
  const contextText = `Discussion title: ${post.title}\nDiscussion body: ${post.body}\nSelected replies:\n${post.replies.map((reply) => `[${reply.id}] ${reply.body}`).join("\n")}`;
  const result = await generateAi("ARTIFACT_DRAFT", contextText); const output = await saveAiOutput({ kind: "ARTIFACT_DRAFT", result, artifactId: id, requestedById: session.user.id, sourceIds: [post.id, ...post.replies.map((reply) => reply.id)] });
  return NextResponse.json({ output, text: result.text, status: result.status, message: result.error, attribution: { sourcePostId: post.id, replyIds: post.replies.map((reply) => reply.id), note: "AI draft only; review and edit before publishing." } });
}