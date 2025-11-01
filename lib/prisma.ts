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

// Check if DATABASE_URL is using a connection pooler (PgBouncer)
// Supabase pooler URLs typically contain "pooler" in the hostname
const isUsingPooler =
  process.env.DATABASE_URL?.includes("pooler") ||
  process.env.DATABASE_URL?.includes("pgbouncer");

// Prepare connection URL with proper pooler parameters if needed
let connectionUrl = process.env.DATABASE_URL;
if (isUsingPooler) {
  // For Prisma with PgBouncer connection pooler in serverless environments:
  // We need to add connection_limit=1 to prevent multiple PrismaClient instances
  // from creating prepared statements on the same pooled connection
  // This is critical for preventing "prepared statement already exists" errors

  const hasQueryParams = connectionUrl.includes("?");
  const separator = hasQueryParams ? "&" : "?";

  // Add connection_limit=1 first (most important - limits to 1 connection per PrismaClient instance)
  if (!connectionUrl.includes("connection_limit=")) {
    connectionUrl = `${connectionUrl}${separator}connection_limit=1`;
    // Update separator for next param
    const newHasQueryParams = connectionUrl.includes("?");
    const newSeparator = newHasQueryParams ? "&" : "?";

    // Add pgbouncer=true if not present (helps Prisma understand it's using PgBouncer)
    if (!connectionUrl.includes("pgbouncer=true")) {
      connectionUrl = `${connectionUrl}${newSeparator}pgbouncer=true`;
    }
  } else {
    // connection_limit already exists, just add pgbouncer=true if needed
    if (!connectionUrl.includes("pgbouncer=true")) {
      connectionUrl = `${connectionUrl}${separator}pgbouncer=true`;
    }
  }
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
    datasources: {
      db: {
        url: connectionUrl,
      },
    },
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
