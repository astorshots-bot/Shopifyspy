import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Fallback dla buildu - jeśli nie ma DATABASE_URL, użyj lokalnego pliku
const prismaUrl = process.env.DATABASE_URL || "file:./dev.db";
process.env.DATABASE_URL = prismaUrl;

export const prisma = globalForPrisma.prisma || new PrismaClient({
  datasources: {
    db: {
      url: prismaUrl,
    },
  },
});

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
