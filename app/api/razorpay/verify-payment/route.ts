import { NextResponse } from "next/server";
import { getServerAuthSession } from "@/lib/auth-server";
import { verifyPaymentSignature } from "@/lib/razorpay";
import { db } from "@/lib/prisma";
import { safeDbOperation } from "@/lib/db-utils";

export async function POST(req: Request) {
  try {
    const session = await getServerAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      planType = "pro",
      paymentId,
    } = await req.json();

    // Verify payment signature
    const isValidSignature = verifyPaymentSignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    if (!isValidSignature) {
      return NextResponse.json(
        { message: "Invalid payment signature" },
        { status: 400 }
      );
    }

    if (!db) {
      return NextResponse.json(
        { message: "Database connection not available" },
        { status: 500 }
      );
    }

    // Update payment record
    await safeDbOperation(async () => {
      if (!db) throw new Error("Database connection not available");
      return await db.payment.update({
        where: { id: paymentId },
        data: {
          razorpayPaymentId: razorpay_payment_id,
          razorpaySignature: razorpay_signature,
          status: "captured",
        },
      });
    });

    // Check if this is the user's first successful payment
    const previousPayments = await safeDbOperation(async () => {
      if (!db) throw new Error("Database connection not available");
      return await db.payment.findMany({
        where: {
          userId: session.user.id,
          status: "captured",
          id: { not: paymentId }, // Exclude current payment
        },
      });
    });

    const isFirstTimeUser = (previousPayments?.length ?? 0) === 0;

    // Determine credit amount based on plan type
    let creditsToAdd = planType === "pro_yearly" ? 480 : 40;

    // Add extra credits for first-time users
    if (isFirstTimeUser) {
      // Yearly plan gets 50 bonus credits, monthly gets 10
      creditsToAdd += planType === "pro_yearly" ? 50 : 10;
    }

    // Update user subscription and add credits
    const updatedUser = await safeDbOperation(async () => {
      if (!db) throw new Error("Database connection not available");
      return await db.user.update({
        where: { id: session.user.id },
        data: {
          isPro: true,
          subscriptionId: razorpay_payment_id,
          credits: {
            increment: creditsToAdd,
          },
        },
        select: {
          isPro: true,
          subscriptionId: true,
          credits: true,
        },
      });
    });

    return NextResponse.json(
      {
        message: "Payment verified and subscription activated",
        user: updatedUser,
        paymentId: razorpay_payment_id,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error verifying payment:", error);
    return NextResponse.json(
      { message: "Failed to verify payment" },
      { status: 500 }
    );
  }
}
