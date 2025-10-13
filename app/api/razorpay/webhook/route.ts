import { NextResponse } from "next/server";
import { verifyPaymentSignature } from "@/lib/razorpay";
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
    // Find user by payment ID or order ID
    const user = await db.user.findFirst({
      where: {
        OR: [
          { subscriptionId: payment.id },
          { subscriptionId: payment.order_id },
        ],
      },
    });

    if (user) {
      await db.user.update({
        where: { id: user.id },
        data: {
          isPro: true,
          subscriptionId: payment.id,
        },
      });

      console.log(`Payment captured for user ${user.id}`);
    }
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
