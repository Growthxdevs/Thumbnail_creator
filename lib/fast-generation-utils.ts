import { db } from "@/lib/prisma";

// Get the start of the current week (Monday)
function getWeekStart(date: Date = new Date()): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

// Check if user can use fast generation
export async function canUseFastGeneration(
  userId: string,
  isPro: boolean
): Promise<{
  canUse: boolean;
  remainingFastGenerations: number;
  weeklyLimit: number;
  isPro: boolean;
}> {
  const weeklyLimit = 3;

  // Pro users always get fast generation
  if (isPro) {
    return {
      canUse: true,
      remainingFastGenerations: -1, // -1 means unlimited
      weeklyLimit: -1,
      isPro: true,
    };
  }

  const weekStart = getWeekStart();

  console.log("Fast generation check:", {
    userId,
    isPro,
    weekStart: weekStart.toISOString(),
    weeklyLimit,
  });

  // Get or create usage record for this week
  let usage = await db.fastGenerationUsage.findUnique({
    where: {
      userId_weekStart: {
        userId,
        weekStart,
      },
    },
  });

  console.log("Current usage record:", usage);

  if (!usage) {
    usage = await db.fastGenerationUsage.create({
      data: {
        userId,
        weekStart,
        count: 0,
      },
    });
    console.log("Created new usage record:", usage);
  }

  const remaining = Math.max(0, weeklyLimit - usage.count);

  const result = {
    canUse: usage.count < weeklyLimit,
    remainingFastGenerations: remaining,
    weeklyLimit,
    isPro: false,
  };

  console.log("Fast generation result:", result);

  return result;
}

// Record a fast generation usage
export async function recordFastGenerationUsage(userId: string): Promise<void> {
  const weekStart = getWeekStart();

  await db.fastGenerationUsage.upsert({
    where: {
      userId_weekStart: {
        userId,
        weekStart,
      },
    },
    update: {
      count: {
        increment: 1,
      },
    },
    create: {
      userId,
      weekStart,
      count: 1,
    },
  });
}

// Get user's fast generation status
export async function getFastGenerationStatus(userId: string, isPro: boolean) {
  const weekStart = getWeekStart();

  if (isPro) {
    return {
      isPro: true,
      canUse: true,
      remainingFastGenerations: -1,
      weeklyLimit: -1,
      usedThisWeek: 0,
      weekStart,
    };
  }

  const usage = await db.fastGenerationUsage.findUnique({
    where: {
      userId_weekStart: {
        userId,
        weekStart,
      },
    },
  });

  const usedThisWeek = usage?.count || 0;
  const weeklyLimit = 3;
  const remaining = Math.max(0, weeklyLimit - usedThisWeek);

  return {
    isPro: false,
    canUse: usedThisWeek < weeklyLimit,
    remainingFastGenerations: remaining,
    weeklyLimit,
    usedThisWeek,
    weekStart,
  };
}
