import { prisma } from "@/lib/prisma";
import type { JWT } from "next-auth/jwt";

/**
 * Resolves which Pnyx user id a session token should carry. Runs on every
 * session read (not just sign-in) because it also re-checks suspension
 * status. A transient DB failure here must never invalidate an otherwise
 * valid session, so on error the token keeps whatever userId it already
 * had — falling back to the freshly-issued user.id only when there is no
 * prior token to preserve (first sign-in with the DB unreachable).
 */
export async function resolveTokenUserId(
  token: JWT,
  user: { id?: string; email?: string | null } | undefined,
): Promise<JWT> {
  const email = typeof user?.email === "string" ? user.email : typeof token.email === "string" ? token.email : null;
  if (!email) {
    if (user?.id) token.userId = user.id;
    return token;
  }
  try {
    const localUser = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() }, select: { id: true, suspendedUntil: true } });
    if (localUser?.suspendedUntil && localUser.suspendedUntil > new Date()) delete token.userId;
    else if (localUser) token.userId = localUser.id;
    else if (user?.id) token.userId = user.id;
  } catch {
    if (!token.userId && user?.id) token.userId = user.id;
  }
  return token;
}
