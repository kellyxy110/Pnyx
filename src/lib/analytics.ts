import { prisma } from "@/lib/prisma";
import { getEnv } from "@/lib/env";

type AnalyticsInput = { name: string; anonymousId: string; userId?: string; path?: string; properties?: Record<string, string | number | boolean> };

export async function recordAnalyticsEvent(input: AnalyticsInput) {
  const env = getEnv();
  if (env.ANALYTICS_ENABLED !== "true") return null;
  return prisma.analyticsEvent.create({ data: { ...input, properties: input.properties as object | undefined } });
}
