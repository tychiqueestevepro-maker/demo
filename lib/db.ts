import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

// Force clear the cached instance to apply the new connection limit
if (process.env.NODE_ENV !== "production") {
  delete globalForPrisma.prisma;
}

export const prisma = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL?.replace("connection_limit=1", "connection_limit=5"),
  log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
});

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
