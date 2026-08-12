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
      "TURSO_DATABASE_URL is not set. Set it in your .env file or environment variables."
    );
  }

  // Force HTTPS transport for Vercel/serverless environments.
  // libsql:// uses WebSockets which may not be available; https:// uses HTTP fetch.
  const httpUrl = tursoUrl.replace(/^libsql:\/\//, "https://");

  const adapter = new PrismaLibSql({ url: httpUrl, authToken: tursoToken });
  return new PrismaClient({ adapter } as ConstructorParameters<typeof PrismaClient>[0]);
}

export const prisma: PrismaClient =
  globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  (globalThis as unknown as { prisma: PrismaClient }).prisma = prisma;
}
