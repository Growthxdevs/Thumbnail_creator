import { db } from "./prisma";

// Utility function to safely execute database operations with retry logic
export async function safeDbOperation<T>(
  operation: () => Promise<T>,
  retries: number = 5
): Promise<T | null> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      const errorMessage = error?.message || String(error);
      const errorCode = error?.code;

      console.error(
        `Database operation attempt ${attempt}/${retries} failed:`,
        errorMessage.substring(0, 200)
      );

      // Check if it's a prepared statement error (common with connection poolers)
      if (
        errorMessage?.includes("prepared statement") ||
        errorCode === "42P05" ||
        errorMessage?.includes("already exists")
      ) {
        console.log(
          `Prepared statement error detected (code: ${errorCode}), attempt ${attempt}/${retries}`
        );

        if (attempt === retries) {
          console.error(
            "Max retries reached for database operation. This may indicate a connection pooler issue."
          );
          return null;
        }

        // Exponential backoff with jitter: 50ms, 100ms, 200ms, 400ms, 800ms
        // Add small random jitter to prevent thundering herd
        const baseDelay = Math.min(50 * Math.pow(2, attempt - 1), 1000);
        const jitter = Math.random() * 50;
        const delay = baseDelay + jitter;

        console.log(`Retrying in ${Math.round(delay)}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));

        // If we're retrying due to prepared statement error, try disconnecting and reconnecting
        // This helps reset the connection state in serverless environments
        if (attempt > 2 && attempt < retries) {
          try {
            const { db } = await import("./prisma");
            await db.$disconnect();
            await new Promise((resolve) => setTimeout(resolve, 100));
            await db.$connect();
            console.log("Connection reset successful");
          } catch (reconnectError) {
            console.warn("Failed to reset connection:", reconnectError);
          }
        }

        continue;
      }

      // For other errors, don't retry (validation errors, etc.)
      throw error;
    }
  }

  return null;
}

// Safe user lookup with retry logic
export async function safeUserLookup(userId: string) {
  return safeDbOperation(async () => {
    return await db.user.findUnique({
      where: { id: userId },
      select: { credits: true, isPro: true, subscriptionId: true },
    });
  });
}

// Safe user creation with retry logic
export async function safeUserCreate(data: any) {
  return safeDbOperation(async () => {
    return await db.user.create({ data });
  });
}

// Safe account creation with retry logic
export async function safeAccountCreate(data: any) {
  return safeDbOperation(async () => {
    return await db.account.create({ data });
  });
}
