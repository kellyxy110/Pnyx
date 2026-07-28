import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { generateAi, type AiKind } from "@/lib/ai";
import { saveAiOutput } from "@/lib/ai-persistence";

const kinds = new Set<AiKind>(["SUMMARY", "TAGS", "SOURCE_SUGGESTIONS", "RELATED"]);
export async function POST(request: Request, context: { params: Promise<{ id: string; kind: string }> }) {
  const session = await auth(); if (!session?.user?.id) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const { id, kind: rawKind } = await context.params; const kind = rawKind.toUpperCase() as AiKind;
  if (!kinds.has(kind)) return NextResponse.json({ error: "Unsupported AI action." }, { status: 400 });
  const preferences = await prisma.user.findUnique({ where: { id: session.user.id }, select: { aiEnabled: true } }); if (!preferences?.aiEnabled) return NextResponse.json({ error: "AI assistance is disabled in your preferences." }, { status: 403 });
  const post = await prisma.post.findUnique({ where: { id, isDeleted: false, isDraft: false, visibility: "PUBLIC" }, select: { id: true, title: true, body: true, spaceId: true, replies: { where: { isDeleted: false }, select: { id: true, body: true }, take: 20, orderBy: { createdAt: "asc" } } } });
  if (!post) return NextResponse.json({ error: "Public discussion not found." }, { status: 404 });
  if (kind === "RELATED") {
    const tokens = post.title.toLowerCase().split(/[^a-z0-9]+/).filter((token) => token.length > 3).slice(0, 4);
    const related = tokens.length ? await prisma.post.findMany({ where: { spaceId: post.spaceId, id: { not: id }, isDeleted: false, isDraft: false, visibility: "PUBLIC", OR: tokens.flatMap((token) => [{ title: { contains: token, mode: "insensitive" as const } }, { body: { contains: token, mode: "insensitive" as const } }]) }, select: { id: true, title: true, body: true }, orderBy: { createdAt: "desc" }, take: 5 }) : [];
    const result = await saveAiOutput({ kind, result: { provider: "pnyx-retrieval", model: "keyword-v1", policyVersion: "pnyx-ai-2026-07-28-v1", status: "COMPLETED", text: JSON.stringify(related.map((item) => item.id)), sourceIds: related.map((item) => item.id), latencyMs: 0 }, postId: id, requestedById: session.user.id, sourceIds: related.map((item) => item.id) });
    return NextResponse.json({ output: result, related });
  }
  const contextText = `Title: ${post.title}\nBody: ${post.body}\nReplies:\n${post.replies.map((reply) => `[${reply.id}] ${reply.body}`).join("\n")}`;
  const result = await generateAi(kind, contextText); const output = await saveAiOutput({ kind, result, postId: id, requestedById: session.user.id, sourceIds: post.replies.map((reply) => reply.id) });
  return NextResponse.json({ output, available: result.status === "COMPLETED", text: result.text, status: result.status, message: result.error });
}