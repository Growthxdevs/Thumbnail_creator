import Razorpay from "razorpay";
import crypto from "crypto";

// Initialize Razorpay instance
export const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

// Razorpay configuration
export const razorpayConfig = {
  key_id: process.env.RAZORPAY_KEY_ID!,
  currency: "INR",
  name: "Thumbnail Creator",
  description: "Professional Thumbnail Creation Service",
  image: "/favicon.ico", // You can update this to your logo
  theme: {
    color: "#2563eb", // Blue theme to match your app
  },
};

// Plan configurations
export const plans = {
  pro: {
    id: "pro_monthly",
    name: "Professional Plan",
    amount: 300, // ₹3 in paise (300 paise = ₹3)
    currency: "INR",
    interval: "monthly",
    description: "Unlimited generations, all fonts, priority support",
  },
};

// Helper function to create order
export async function createRazorpayOrder(
  amount: number,
  currency: string = "INR"
) {
  try {
    const order = await razorpay.orders.create({
      amount: amount * 100, // Convert to paise
      currency,
      receipt: `receipt_${Date.now()}`,
      notes: {
        plan: "pro_monthly",
        description: "Professional Plan Subscription",
      },
      // Add these options for better test support
      partial_payment: false,
      payment_capture: true,
    });

    return order;
  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    throw error;
  }
}

// Helper function to verify payment signature
export function verifyPaymentSignature(
  razorpay_order_id: string,
  razorpay_payment_id: string,
  razorpay_signature: string
): boolean {
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  return expectedSignature === razorpay_signature;
}
