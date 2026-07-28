import { z } from "zod";

export const artifactSchema = z.object({
  spaceSlug: z.string().min(1).max(80).regex(/^[a-z0-9-]+$/),
  type: z.enum(["GUIDE", "ANSWER", "RESEARCH", "BENCHMARK", "CASE_STUDY"]),
  status: z.enum(["DRAFT", "PUBLISHED", "COMMUNITY_REVIEWED", "VERIFIED"]).default("DRAFT"),
  title: z.string().trim().min(3).max(200),
  summary: z.string().trim().max(1000).optional(),
  body: z.string().trim().min(1).max(50000),
  sourcePostId: z.string().cuid().nullable().optional(),
  sourceReplyId: z.string().cuid().nullable().optional(),
});

export const revisionSchema = z.object({ title: z.string().trim().min(3).max(200), body: z.string().trim().min(1).max(50000), changeSummary: z.string().trim().max(500).optional() });
export const sourceSchema = z.object({ url: z.string().url().max(2000), title: z.string().trim().max(300).optional(), citation: z.string().trim().max(500).optional() });
export const contributorSchema = z.object({ userId: z.string().cuid(), role: z.string().trim().min(2).max(80).default("CONTRIBUTOR") });
export const artifactReportSchema = z.object({ reason: z.enum(["INCORRECT", "OUTDATED", "UNSOURCED", "COPYRIGHT", "OTHER"]), details: z.string().trim().max(2000).optional() });
