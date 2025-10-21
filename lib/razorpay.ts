import Razorpay from "razorpay";
import crypto from "crypto";

// Validate required environment variables
const validateRazorpayConfig = () => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new Error(
      `Missing required Razorpay environment variables. Please set:
      - RAZORPAY_KEY_ID
      - RAZORPAY_KEY_SECRET
      
      Add these to your .env.local file. See RAZORPAY_SETUP.md for instructions.`
    );
  }

  return { keyId, keySecret };
};

// Initialize Razorpay instance
const { keyId, keySecret } = validateRazorpayConfig();
export const razorpay = new Razorpay({
  key_id: keyId,
  key_secret: keySecret,
});

// Razorpay configuration
export const razorpayConfig = {
  key_id: keyId,
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
    .createHmac("sha256", keySecret)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  return expectedSignature === razorpay_signature;
}
