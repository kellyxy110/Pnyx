import { prisma } from "@/lib/prisma";
import type { AiKind, AiResult } from "@/lib/ai";

export async function saveAiOutput(input: { kind: AiKind; result: AiResult; postId?: string; artifactId?: string; requestedById?: string; sourceIds?: string[] }) {
  return prisma.aiOutput.create({ data: { kind: input.kind, provider: input.result.provider, model: input.result.model, policyVersion: input.result.policyVersion, sourceIds: input.sourceIds ?? input.result.sourceIds, output: { text: input.result.text, latencyMs: input.result.latencyMs, error: input.result.error }, status: input.result.status, postId: input.postId, artifactId: input.artifactId, requestedById: input.requestedById } });
}