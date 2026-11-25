import { z } from "zod";

export const recoveryEmailSchema = z.object({ email: z.string().trim().toLowerCase().email() });
export const recoveryTokenSchema = z.object({ token: z.string().min(32).max(512) });
export const resetPasswordSchema = recoveryTokenSchema.extend({ password: z.string().min(12).max(128) });

export function parseJson<T>(value: unknown, schema: z.ZodSchema<T>): T | null {
  const parsed = schema.safeParse(value);
  return parsed.success ? parsed.data : null;
}
