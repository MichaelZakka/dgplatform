import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

// Reuse a single PrismaClient across hot reloads in development to avoid
// exhausting database connections.
const globalForPrisma = globalThis as unknown as {
  __damascusPrisma?: PrismaClient;
};

function createPrismaClient(): PrismaClient {
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
  });
  return new PrismaClient({ adapter });
}

export const prisma: PrismaClient =
  globalForPrisma.__damascusPrisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.__damascusPrisma = prisma;
}
