"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles } from "lucide-react";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import RazorpayPayment from "./razorpay-payment";
import PaymentSuccess from "./payment-success";

export default function PlanModal() {
  const [open, setOpen] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [successPaymentId, setSuccessPaymentId] = useState<string>("");

  const handlePaymentSuccess = (paymentId: string) => {
    console.log("Payment successful:", paymentId);
    setSuccessPaymentId(paymentId);
    setPaymentSuccess(true);
    setOpen(false);
  };

  const handlePaymentError = (error: any) => {
    console.error("Payment error:", error);
    // You can add error handling here
    // For example, show an error message
  };

  return (
    <PayPalScriptProvider
      options={{
        clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "",
        vault: true,
        intent: "subscription",
      }}
    >
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            className="hover:scale-105 transition-transform"
          >
            Upgrade your plan
          </Button>
        </DialogTrigger>

        <DialogContent className="max-w-lg sm:max-w-3xl p-8">
          <DialogTitle className="text-2xl font-bold text-center mb-6">
            Choose Your Perfect Plan
            <p className="text-sm font-normal text-gray-500 mt-2">
              Select the plan that best suits your needs
            </p>
          </DialogTitle>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Free Plan */}
            <Card className="relative border border-gray-200 hover:border-gray-300 transition-all duration-300 hover:shadow-md">
              <CardHeader className="space-y-1 pb-2">
                <Badge variant="secondary" className="w-fit mb-2">
                  FREE
                </Badge>
                <h3 className="text-2xl font-bold">Starter</h3>
                <p className="text-gray-500 text-sm">
                  Perfect for trying out our service
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-3xl font-bold">
                  $0
                  <span className="text-base font-normal text-gray-500">
                    /mo
                  </span>
                </p>

                <div className="space-y-3">
                  {[
                    "3 free generations per account",
                    "Access to 6 curated fonts",
                    "Basic support",
                  ].map((feature) => (
                    <div key={feature} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span className="text-gray-600 text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                <Button
                  variant="outline"
                  className="w-full hover:scale-105 transition-transform"
                >
                  Get Started
                </Button>
              </CardContent>
            </Card>

            {/* Pro Plan */}
            <Card className="relative border-2 border-blue-500 hover:border-blue-600 transition-all duration-300 hover:shadow-xl bg-gradient-to-b from-blue-50 to-white">
              <div className="absolute -top-3 right-4">
                <Badge className="bg-blue-500 hover:bg-blue-600">
                  <Sparkles className="h-3 w-3 mr-1" />
                  MOST POPULAR
                </Badge>
              </div>

              <CardHeader className="space-y-1 pb-2">
                <Badge
                  variant="secondary"
                  className="w-fit mb-2 bg-blue-100 text-blue-700 hover:bg-blue-200"
                >
                  PRO
                </Badge>
                <h3 className="text-2xl font-bold">Professional</h3>
                <p className="text-gray-500 text-sm">
                  Everything you need for serious design work
                </p>
              </CardHeader>

              <CardContent className="space-y-6">
                <p className="text-3xl font-bold">
                  $3
                  <span className="text-base font-normal text-gray-500">
                    /mo
                  </span>
                </p>

                <div className="space-y-3">
                  {[
                    "Unlimited generations",
                    "Access to all 250+ premium fonts",
                    "Priority support",
                    "Advanced customization options",
                  ].map((feature) => (
                    <div key={feature} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-blue-500 flex-shrink-0" />
                      <span className="text-gray-600 text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Payment Options */}
                <div className="space-y-3">
                  {/* PayPal Subscription Button */}
                  <PayPalButtons
                    createSubscription={(data, actions) => {
                      const planId =
                        process.env.NEXT_PUBLIC_PAYPAL_PLAN_ID || "";

                      return actions.subscription.create({
                        plan_id: planId,
                      });
                    }}
                    onApprove={(data) => {
                      console.log("Subscription successful!", data);
                      // Here, send the subscription data to your backend for further processing.
                      return Promise.resolve();
                    }}
                    onError={(err) => {
                      console.error("PayPal Error:", err);
                    }}
                  />

                  {/* Divider */}
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white px-2 text-gray-500">Or</span>
                    </div>
                  </div>

                  {/* Razorpay Payment Button */}
                  <RazorpayPayment
                    planType="pro"
                    onSuccess={handlePaymentSuccess}
                    onError={handlePaymentError}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>

      {/* Payment Success Modal */}
      <PaymentSuccess
        open={paymentSuccess}
        onClose={() => setPaymentSuccess(false)}
        paymentId={successPaymentId}
      />
    </PayPalScriptProvider>
  );
}
