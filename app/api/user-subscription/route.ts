import { NextResponse } from "next/server";
import { getServerAuthSession } from "@/lib/auth-server";
import { db } from "@/lib/prisma";
import { safeDbOperation } from "@/lib/db-utils";

export async function GET() {
  try {
    const session = await getServerAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const user = await safeDbOperation(async () => {
      return await db.user.findUnique({
        where: { id: session.user.id },
        select: {
          credits: true,
          isPro: true,
          subscriptionId: true,
          email: true,
          name: true,
        },
      });
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Get the latest successful payment to determine plan type
    const latestPayment = await safeDbOperation(async () => {
      return await db.payment.findFirst({
        where: {
          userId: session.user.id,
          status: "captured",
        },
        orderBy: {
          createdAt: "desc",
        },
        select: {
          planType: true,
        },
      });
    });

    // Determine current plan type
    let currentPlanType: "free" | "pro" | "pro_yearly" = "free";
    if (user.isPro) {
      currentPlanType =
        latestPayment?.planType === "pro_yearly" ? "pro_yearly" : "pro";
    }

    // Check if user is a first-time user (no previous successful payments)
    const previousPayments = await safeDbOperation(async () => {
      return await db.payment.findMany({
        where: {
          userId: session.user.id,
          status: "captured",
        },
      });
    });

    const isFirstTimeUser = (previousPayments?.length ?? 0) === 0;

    return NextResponse.json(
      {
        ...user,
        currentPlanType,
        isFirstTimeUser,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching user subscription:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
