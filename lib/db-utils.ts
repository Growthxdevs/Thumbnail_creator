import { db } from "./prisma";

// Utility function to safely execute database operations with retry logic
export async function safeDbOperation<T>(
  operation: () => Promise<T>,
  retries: number = 3
): Promise<T | null> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      console.error(`Database operation attempt ${attempt} failed:`, error);

      // Check if it's a prepared statement error
      if (
        error?.message?.includes("prepared statement") ||
        error?.code === "42P05"
      ) {
        console.log(
          `Prepared statement error detected, attempt ${attempt}/${retries}`
        );

        if (attempt === retries) {
          console.error("Max retries reached for database operation");
          return null;
        }

        // Wait a bit before retrying
        await new Promise((resolve) => setTimeout(resolve, 100 * attempt));
        continue;
      }

      // For other errors, don't retry
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
