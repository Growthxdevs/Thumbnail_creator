import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const signature = req.headers.get("x-razorpay-signature");

    if (!signature) {
      return NextResponse.json(
        { message: "Missing signature" },
        { status: 400 }
      );
    }

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET!)
      .update(body)
      .digest("hex");

    if (signature !== expectedSignature) {
      return NextResponse.json(
        { message: "Invalid signature" },
        { status: 400 }
      );
    }

    const event = JSON.parse(body);

    // Handle different webhook events
    switch (event.event) {
      case "payment.captured":
        await handlePaymentCaptured(event.payload.payment.entity);
        break;
      case "payment.failed":
        await handlePaymentFailed(event.payload.payment.entity);
        break;
      default:
        console.log("Unhandled webhook event:", event.event);
    }

    return NextResponse.json({ message: "Webhook processed" }, { status: 200 });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json(
      { message: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

async function handlePaymentCaptured(payment: any) {
  try {
    // Find payment record to get planType
    const paymentRecord = await db.payment.findFirst({
      where: {
        razorpayPaymentId: payment.id,
        OR: [{ razorpayOrderId: payment.order_id }],
      },
      select: {
        id: true,
        userId: true,
        planType: true,
      },
    });

    if (!paymentRecord) {
      console.log(`Payment record not found for payment ${payment.id}`);
      return;
    }

    // Check if this is the user's first successful payment
    // Exclude current payment by its database ID
    const previousPayments = await db.payment.findMany({
      where: {
        userId: paymentRecord.userId,
        status: "captured",
        id: { not: paymentRecord.id }, // Exclude current payment
      },
    });

    const isFirstTimeUser = previousPayments.length === 0;

    // Determine credit amount based on plan type
    let creditsToAdd = paymentRecord.planType === "pro_yearly" ? 480 : 40;

    // Add extra credits for first-time users
    if (isFirstTimeUser) {
      // Yearly plan gets 50 bonus credits, monthly gets 10
      creditsToAdd += paymentRecord.planType === "pro_yearly" ? 50 : 10;
    }

    // Update user subscription and add credits
    await db.user.update({
      where: { id: paymentRecord.userId },
      data: {
        isPro: true,
        subscriptionId: payment.id,
        credits: {
          increment: creditsToAdd,
        },
      },
    });

    const bonusCredits = isFirstTimeUser
      ? paymentRecord.planType === "pro_yearly"
        ? 50
        : 10
      : 0;

    console.log(
      `Payment captured for user ${
        paymentRecord.userId
      }, added ${creditsToAdd} credits${
        isFirstTimeUser
          ? ` (includes ${bonusCredits} bonus credits for first-time user)`
          : ""
      }`
    );
  } catch (error) {
    console.error("Error handling payment captured:", error);
  }
}

async function handlePaymentFailed(payment: any) {
  try {
    // Log failed payment for debugging
    console.log(`Payment failed: ${payment.id}`, payment);

    // You might want to notify the user or take other actions
  } catch (error) {
    console.error("Error handling payment failed:", error);
  }
}
