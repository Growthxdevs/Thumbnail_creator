import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined;
};

// Ensure DATABASE_URL is available
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL environment variable is not set. Please check your environment configuration."
  );
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

// Always use singleton pattern to prevent multiple PrismaClient instances
// This is especially important in serverless environments where multiple
// function invocations might try to create separate instances, causing
// "prepared statement already exists" errors when using connection pooling
if (!globalForPrisma.prisma) {
  globalForPrisma.prisma = db;
}

// Handle graceful shutdown
if (typeof window === "undefined") {
  process.on("beforeExit", async () => {
    await db.$disconnect();
  });
}
