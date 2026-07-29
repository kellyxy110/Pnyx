import { prisma } from "@/lib/prisma";

export function usernameBase(email: string) {
  const base = email.split("@")[0].toLowerCase().replace(/[^a-z0-9_-]/g, "-").replace(/^-+|-+$/g, "").slice(0, 24);
  return base || "pnyx-member";
}

export async function ensureOAuthUser(user: { id?: string; email?: string | null; name?: string | null }, account: { provider: string; providerAccountId: string }) {
  const email = user.email?.trim().toLowerCase();
  if (!email) return null;
  const existingLink = await prisma.oAuthAccount.findUnique({ where: { provider_providerAccountId: { provider: account.provider, providerAccountId: account.providerAccountId } } });
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingLink && (!existingUser || existingLink.userId !== existingUser.id)) return null;
  let dbUser = existingUser;
  if (dbUser?.suspendedUntil && dbUser.suspendedUntil > new Date()) return null;
  if (!dbUser) {
    const base = usernameBase(email);
    let username = base;
    for (let suffix = 2; await prisma.user.findUnique({ where: { username } }); suffix += 1) username = `${base.slice(0, 30 - String(suffix).length - 1)}-${suffix}`;
    dbUser = await prisma.user.create({ data: { email, username, displayName: user.name?.trim() || username, emailVerifiedAt: new Date() } });
  }
  if (!existingLink) await prisma.oAuthAccount.create({ data: { provider: account.provider, providerAccountId: account.providerAccountId, userId: dbUser.id } });
  user.id = dbUser.id;
  user.email = dbUser.email;
  user.name = dbUser.displayName;
  return dbUser;
}
