import { z } from "zod";
export const searchQuerySchema = z.object({
  q: z.string().trim().min(2).max(120),
  type: z.enum(["all", "posts", "replies", "artifacts", "spaces", "people"]).default("all"),
  space: z.string().trim().max(80).optional(), author: z.string().trim().max(80).optional(),
  from: z.string().date().optional(), to: z.string().date().optional(),
  status: z.enum(["PUBLISHED", "COMMUNITY_REVIEWED", "VERIFIED"]).optional(),
  page: z.coerce.number().int().min(1).max(100).default(1),
}).refine(value => !value.from || !value.to || value.from <= value.to, { message: "From date must be before To date.", path: ["to"] });
