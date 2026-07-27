import { prisma } from "@/lib/prisma";

export type HealthStatus = { status: "ok" | "degraded"; service: "pnyx"; database: "ok" | "error"; timestamp: string };

export async function checkHealth(): Promise<HealthStatus> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return { status: "ok", service: "pnyx", database: "ok", timestamp: new Date().toISOString() };
  } catch {
    return { status: "degraded", service: "pnyx", database: "error", timestamp: new Date().toISOString() };
  }
}
