import { PrismaClient } from "@/app/generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  const tursoUrl = process.env.TURSO_DATABASE_URL;
  const tursoToken = process.env.TURSO_AUTH_TOKEN;

  if (!tursoUrl) {
    throw new Error(
      "TURSO_DATABASE_URL is not set."
    );
  }

  // Force HTTPS transport — libsql:// uses WebSockets which are not available
  // in Vercel serverless. https:// uses HTTP fetch which works everywhere.
  const url = tursoUrl.replace(/^libsql:\/\//, "https://");

  const adapter = new PrismaLibSql({ url, authToken: tursoToken });
  return new PrismaClient({ adapter } as ConstructorParameters<typeof PrismaClient>[0]);
}

function getPrisma(): PrismaClient {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrismaClient();
  }
  return globalForPrisma.prisma;
}

// Lazy proxy — defers PrismaClient instantiation until the first property access,
// ensuring env vars are available at runtime rather than at module import time.
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    return getPrisma()[prop as keyof PrismaClient];
  },
});
