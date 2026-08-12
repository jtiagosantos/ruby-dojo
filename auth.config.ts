import type { NextAuthConfig } from "next-auth";
import GitHub from "next-auth/providers/github";

// This config is used in middleware (Edge Runtime) — NO Prisma, NO Node.js APIs
export const authConfig: NextAuthConfig = {
  trustHost: true,
  session: { strategy: "jwt" },
  cookies: {
    sessionToken: {
      name: "ruby-dojo.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: false,
      },
    },
  },
  providers: [
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request }) {
      const pathname = request.nextUrl.pathname;
      const isProtected =
        /^\/practice\/[^/]+$/.test(pathname) ||
        pathname === "/profile" ||
        pathname === "/ranking";

      if (isProtected && !auth) {
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("callbackUrl", pathname);
        return Response.redirect(loginUrl);
      }
      return true;
    },
  },
};
