"use client";

import { useState } from "react";
import RazorpayPayment from "@/components/razorpay-payment";
import PaymentSuccess from "@/components/payment-success";

export default function TestRazorpayPage() {
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [successPaymentId, setSuccessPaymentId] = useState<string>("");

  const handlePaymentSuccess = (paymentId: string) => {
    setSuccessPaymentId(paymentId);
    setPaymentSuccess(true);
  };

  const handlePaymentError = (error: any) => {
    console.error("Payment error:", error);
    alert("Payment failed: " + error.message);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-center mb-6">
          Test Razorpay Integration
        </h1>

        <div className="space-y-4">
          <div className="text-center">
            <h2 className="text-lg font-semibold mb-2">Professional Plan</h2>
            <p className="text-gray-600 mb-4">
              ₹3/month - Unlimited generations
            </p>
          </div>

          <RazorpayPayment
            planType="pro"
            onSuccess={handlePaymentSuccess}
            onError={handlePaymentError}
          />

          <div className="text-xs text-gray-500 text-center">
            <p>Test with Razorpay test cards:</p>
            <p>Success: 4111 1111 1111 1111</p>
            <p>Failure: 4000 0000 0000 0002</p>
          </div>
        </div>
      </div>

      <PaymentSuccess
        open={paymentSuccess}
        onClose={() => setPaymentSuccess(false)}
        paymentId={successPaymentId}
      />
    </div>
  );
}
