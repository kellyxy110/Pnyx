import { z } from "zod";

export const postSchema = z.object({
  spaceSlug: z.string().min(1).max(80).regex(/^[a-z0-9-]+$/),
  type: z.enum(["QUESTION", "DISCUSSION", "SHOWCASE", "TUTORIAL", "RESEARCH", "ANNOUNCEMENT", "POLL"]),
  title: z.string().trim().min(3).max(200),
  body: z.string().trim().min(1).max(20000),
  visibility: z.enum(["PUBLIC", "SPACE_ONLY", "FOLLOWERS_ONLY", "PRIVATE"]).default("PUBLIC"),
  isDraft: z.boolean().default(false),
  pollOptions: z.array(z.string().trim().min(1).max(120)).min(2).max(8).optional(),
});

export const replySchema = z.object({ body: z.string().trim().min(1).max(10000), parentId: z.string().cuid().nullable().optional() });
export const reactionSchema = z.object({ type: z.enum(["LIKE", "HELPFUL", "INSIGHTFUL"]).default("LIKE") });
export const reportSchema = z.object({ reason: z.enum(["SPAM", "HARASSMENT", "MISINFORMATION", "COPYRIGHT", "OTHER"]), details: z.string().trim().max(2000).optional() });
export const pageSchema = z.coerce.number().int().min(1).max(100).default(1);
