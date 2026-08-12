import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { authConfig } from "./auth.config";

// In production on Vercel, AUTH_URL must be set to the deployment URL.
// VERCEL_URL is automatically provided by Vercel but without protocol.
const authUrl =
  process.env.AUTH_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined);

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  ...(authUrl ? { basePath: "/api/auth", trustHost: true } : {}),
  providers: [
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
    }),
  ],
  adapter: PrismaAdapter(prisma),
  callbacks: {
    ...authConfig.callbacks,
    session({ session, token }) {
      if (token?.sub) session.user.id = token.sub;
      return session;
    },
    jwt({ token, user }) {
      if (user?.id) token.sub = user.id;
      return token;
    },
  },
});
