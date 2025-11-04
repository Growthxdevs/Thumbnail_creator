import { NextResponse } from "next/server";
import { getServerAuthSession } from "@/lib/auth-server";
import { createRazorpayOrder, plansINR, plansUSD } from "@/lib/razorpay";
import { db } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { planType = "pro", currency = "INR" } = await req.json();

    // Select the appropriate plan based on currency
    const plans = currency === "USD" ? plansUSD : plansINR;

    if (!plans[planType as keyof typeof plans]) {
      return NextResponse.json(
        { message: "Invalid plan type" },
        { status: 400 }
      );
    }

    const plan = plans[planType as keyof typeof plans];
    const order = await createRazorpayOrder(plan.amount, plan.currency);

    // Create payment record in database
    const payment = await db.payment.create({
      data: {
        userId: session.user.id,
        razorpayOrderId: order.id,
        amount: order.amount,
        currency: order.currency,
        status: "pending",
        planType: planType,
      },
    });

    return NextResponse.json(
      {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        key: process.env.RAZORPAY_KEY_ID,
        paymentId: payment.id,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    return NextResponse.json(
      { message: "Failed to create order" },
      { status: 500 }
    );
  }
}
