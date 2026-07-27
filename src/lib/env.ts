import { z } from "zod";

const schema = z.object({
  DATABASE_URL: z.string().url().refine((value) => value.startsWith("postgres"), "DATABASE_URL must be a PostgreSQL URL"),
  APP_URL: z.string().url(),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
  ANALYTICS_ENABLED: z.enum(["true", "false"]).default("false"),
});

export function getEnv(input: NodeJS.ProcessEnv = process.env) {
  return schema.parse(input);
}
