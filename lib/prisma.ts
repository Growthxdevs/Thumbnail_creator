import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined;
};

// Only validate DATABASE_URL on server side (not in browser)
// Prisma Client should only be used on the server
const isServer = typeof window === "undefined";

// Ensure DATABASE_URL is available (only on server)
if (isServer && !process.env.DATABASE_URL) {
  const errorMessage = `
═══════════════════════════════════════════════════════════
❌ DATABASE_URL environment variable is not set!

To fix this issue:
1. Create a .env.local file in the root of your project
2. Add the following line:
   DATABASE_URL="your-postgresql-connection-string"

Example:
   DATABASE_URL="postgresql://user:password@localhost:5432/dbname"

For more information, see:
- AUTH_SETUP.md for local development setup
- DEPLOYMENT_GUIDE.md for production deployment

═══════════════════════════════════════════════════════════
  `;
  throw new Error(errorMessage.trim());
}

// Prepare connection URL with proper pooler parameters if needed
// Only process on server side
let connectionUrl: string = "";
if (isServer && process.env.DATABASE_URL) {
  connectionUrl = process.env.DATABASE_URL;

  // Check if DATABASE_URL is using a connection pooler (PgBouncer)
  // Supabase pooler URLs typically contain "pooler" in the hostname
  const isUsingPooler =
    connectionUrl.includes("pooler") || connectionUrl.includes("pgbouncer");

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
}

// Only create PrismaClient on server side
// On client side, export null (Prisma should never be used on client)
export const db: PrismaClient | null = !isServer
  ? null
  : globalForPrisma.prisma ??
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
if (isServer && db !== null && !globalForPrisma.prisma) {
  globalForPrisma.prisma = db;
}

// Handle graceful shutdown (only on server)
if (isServer && db !== null) {
  process.on("beforeExit", async () => {
    await db.$disconnect();
  });
}
