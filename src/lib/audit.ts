import { prisma } from "@/lib/prisma";

type AuditInput = { actorId?: string; action: string; entityType: string; entityId?: string; metadata?: Record<string, unknown> };

export function recordAuditEvent(input: AuditInput) {
  return prisma.auditEvent.create({ data: { ...input, metadata: input.metadata as object | undefined } });
}
