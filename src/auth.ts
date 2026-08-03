import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { ensureOAuthUser } from "@/lib/oauth-account";

const oauthProviders = [];
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) oauthProviders.push(Google({ clientId: process.env.GOOGLE_CLIENT_ID, clientSecret: process.env.GOOGLE_CLIENT_SECRET }));
if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) oauthProviders.push(GitHub({ clientId: process.env.GITHUB_CLIENT_ID, clientSecret: process.env.GITHUB_CLIENT_SECRET }));
const credentialsSchema = z.object({ email: z.string().email(), password: z.string().min(12).max(128) });

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.AUTH_SECRET,
  trustHost: true,
  session: { strategy: "jwt", maxAge: 60 * 60 * 24 * 30 },
  providers: [...oauthProviders, Credentials({
    credentials: { email: {}, password: {} },
    async authorize(raw) {
      const parsed = credentialsSchema.safeParse(raw);
      if (!parsed.success) return null;
      const user = await prisma.user.findUnique({ where: { email: parsed.data.email.toLowerCase() } });
      if (!user?.passwordHash || !user.emailVerifiedAt) return null;
      if (user.suspendedUntil && user.suspendedUntil > new Date()) return null;
      if (!(await bcrypt.compare(parsed.data.password, user.passwordHash))) return null;
      return { id: user.id, email: user.email, name: user.displayName };
    },
  })],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.type !== "oauth") return true;
      return Boolean(await ensureOAuthUser(user, { provider: account.provider, providerAccountId: account.providerAccountId }));
    },
    async jwt({ token, user }) {
      const email = typeof user?.email === "string" ? user.email : typeof token.email === "string" ? token.email : null;
      if (email) {
        const localUser = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() }, select: { id: true, suspendedUntil: true } });
        if (localUser?.suspendedUntil && localUser.suspendedUntil > new Date()) delete token.userId;
        else if (localUser) token.userId = localUser.id;
        else if (user?.id) token.userId = user.id;
      } else if (user?.id) token.userId = user.id;
      return token;
    },
    async session({ session, token }) {
      if (session.user && typeof token.userId === "string") session.user.id = token.userId;
      return session;
    },
  },
  pages: { signIn: "/sign-in" },
});
