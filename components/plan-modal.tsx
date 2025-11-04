"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles, X, Loader2 } from "lucide-react";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import RazorpayPayment from "./razorpay-payment";
import PaymentSuccess from "./payment-success";
import { useCreditStore } from "@/stores/credit-store";

interface PlanModalProps {
  onPaymentSuccess?: () => void;
}

export default function PlanModal({ onPaymentSuccess }: PlanModalProps = {}) {
  const { data: session } = useSession();
  const { setCredits } = useCreditStore();
  const [open, setOpen] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [successPaymentId, setSuccessPaymentId] = useState<string>("");
  const [userData, setUserData] = useState<{
    isPro?: boolean;
    currentPlanType?: "free" | "pro" | "pro_yearly";
    credits?: number;
    isFirstTimeUser?: boolean;
  } | null>(null);
  const [loadingUserData, setLoadingUserData] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoadingUserData(true);
        const response = await fetch("/api/user-subscription");
        if (response.ok) {
          const data = await response.json();
          setUserData(data);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoadingUserData(false);
      }
    };

    if (session && open) {
      fetchUserData();
    }
  }, [session, open]);

  const handlePaymentSuccess = async (paymentId: string) => {
    console.log("Payment successful:", paymentId);
    setSuccessPaymentId(paymentId);
    setPaymentSuccess(true);
    setOpen(false);

    // Wait a moment to ensure payment is processed in the database
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Refresh user data and update credit store
    try {
      const response = await fetch("/api/user-subscription");
      if (response.ok) {
        const data = await response.json();
        setUserData(data);

        // Update credit store immediately
        if (data.credits !== undefined) {
          setCredits(data.credits);
        }

        // Notify parent component to refresh
        onPaymentSuccess?.();

        // Force session refresh by reloading (optional, can be removed if using session refresh)
        // This ensures all components that depend on session get updated credits
        if (typeof window !== "undefined") {
          // Trigger a custom event for components to refresh
          window.dispatchEvent(new CustomEvent("creditsUpdated"));
        }
      }
    } catch (error) {
      console.error("Error refreshing user data:", error);
    }
  };

  const handlePaymentError = (error: unknown) => {
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

        <DialogContent className="max-w-lg sm:max-w-6xl p-5 sm:p-6 max-h-[98vh] overflow-hidden bg-black border-gray-800">
          <DialogTitle className="text-xl sm:text-2xl font-bold text-center mb-4 text-white">
            Choose Your Perfect Plan
            <p className="text-xs font-normal text-gray-400 mt-1.5">
              Select the plan that best suits your needs
            </p>
          </DialogTitle>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5 items-stretch">
            {/* Free Plan */}
            <Card className="relative border border-gray-700 hover:border-gray-600 transition-all duration-300 hover:shadow-md bg-black/40 backdrop-blur-md flex flex-col h-full">
              <CardHeader className="space-y-0 pb-1 pt-3 px-3 flex-shrink-0">
                <Badge variant="secondary" className="w-fit mb-1 text-xs">
                  FREE
                </Badge>
                <h3 className="text-lg font-bold text-white">Starter</h3>
                <p className="text-gray-400 text-xs">
                  Perfect for trying out our service
                </p>
              </CardHeader>
              <CardContent className="space-y-4 px-3 pb-3 flex flex-col flex-grow min-h-0">
                <p className="text-2xl font-bold text-white">
                  ₹0
                  <span className="text-sm font-normal text-gray-400">/mo</span>
                </p>

                <div className="space-y-2 flex-grow">
                  <p className="text-xs font-semibold text-gray-300">
                    Limitations:
                  </p>
                  {[
                    "Only 3 free generations per account",
                    "Limited to 6 basic fonts",
                    "Basic support only",
                    "No advanced customization",
                    "No priority processing",
                  ].map((limitation) => (
                    <div key={limitation} className="flex items-center gap-1.5">
                      <X className="h-3 w-3 text-red-400 flex-shrink-0" />
                      <span className="text-gray-400 text-xs">
                        {limitation}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-auto pt-2 flex-shrink-0">
                  <Button
                    variant="outline"
                    className={`w-full h-10 text-sm hover:scale-105 transition-transform border-gray-600 text-white hover:bg-gray-800 bg-black/20 ${
                      userData?.currentPlanType === "free"
                        ? ""
                        : "opacity-50 cursor-not-allowed"
                    }`}
                    disabled={userData?.currentPlanType !== "free"}
                  >
                    {userData?.currentPlanType === "free"
                      ? "Current Plan"
                      : "Free Plan"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Pro Monthly Plan */}
            <Card className="relative border-2 border-blue-500 hover:border-blue-400 transition-all duration-300 hover:shadow-xl bg-black/40 backdrop-blur-md flex flex-col h-full">
              <div className="absolute -top-2 right-2">
                <Badge className="bg-blue-500 hover:bg-blue-600 text-xs py-0.5 px-1.5">
                  <Sparkles className="h-2.5 w-2.5 mr-0.5" />
                  MOST POPULAR
                </Badge>
              </div>

              <CardHeader className="space-y-0 pb-1 pt-3 px-3 flex-shrink-0">
                <div className="flex items-center gap-1.5 mb-1">
                  <Badge
                    variant="secondary"
                    className="bg-blue-100 text-blue-700 hover:bg-blue-200 text-xs py-0"
                  >
                    PRO
                  </Badge>
                  <Badge
                    variant="outline"
                    className="bg-blue-100 text-blue-700 border-blue-300 text-xs py-0"
                  >
                    Early-Bird
                  </Badge>
                </div>
                <h3 className="text-lg font-bold text-white">Monthly Plan</h3>
                <p className="text-gray-400 text-xs">
                  Perfect for regular users
                </p>
              </CardHeader>

              <CardContent className="space-y-4 px-3 pb-3 flex flex-col flex-grow min-h-0">
                <div>
                  <p className="text-2xl font-bold text-white">
                    ₹99
                    <span className="text-sm font-normal text-gray-400">
                      /mo
                    </span>
                  </p>
                  <p className="text-xs text-gray-400 line-through mt-1">
                    Regular: ₹199/month
                  </p>
                </div>

                <div className="bg-blue-500/20 p-2.5 rounded-lg border border-blue-500/50">
                  <div className="flex items-baseline gap-2">
                    <p className="text-base font-bold text-blue-300">
                      {userData?.isFirstTimeUser ? "50 Credits" : "40 Credits"}
                    </p>
                    {userData?.isFirstTimeUser && (
                      <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-black text-xs font-bold px-2 py-0.5 animate-pulse">
                        +10 BONUS
                      </Badge>
                    )}
                  </div>
                  {userData?.isFirstTimeUser && (
                    <p className="text-xs text-blue-200 mt-1">
                      (40 + 10 bonus credits)
                    </p>
                  )}
                  <p className="text-xs text-blue-200">
                    No daily limit - use anytime
                  </p>
                  {userData?.isFirstTimeUser && (
                    <div className="mt-2 p-1.5 bg-yellow-500/20 border border-yellow-400/50 rounded">
                      <p className="text-xs font-bold text-yellow-300">
                        🎉{" "}
                        <span className="text-yellow-400 text-sm font-extrabold">
                          +10
                        </span>{" "}
                        EXTRA CREDITS FOR FIRST-TIME USERS!
                      </p>
                    </div>
                  )}
                </div>

                <div className="space-y-2 flex-grow">
                  {[
                    userData?.isFirstTimeUser
                      ? "50 credits per month (40 + 10 bonus)"
                      : "40 credits per month (use anytime)",
                    "Access to all 250+ premium fonts",
                    "Priority support",
                    "Advanced customization options",
                  ].map((feature) => (
                    <div key={feature} className="flex items-center gap-1.5">
                      <Check className="h-3 w-3 text-blue-500 flex-shrink-0" />
                      <span className="text-gray-300 text-xs">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Payment Options */}
                <div className="mt-auto pt-2 space-y-2.5 flex-shrink-0">
                  {loadingUserData ? (
                    <Button
                      variant="outline"
                      className="w-full h-10 text-sm border-blue-500 text-white bg-blue-500/10 flex items-center justify-center"
                      disabled
                    >
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Loading...
                    </Button>
                  ) : userData?.currentPlanType === "pro" ? (
                    <Button
                      variant="outline"
                      className="w-full h-10 text-sm hover:scale-105 transition-transform border-blue-500 text-white hover:bg-blue-900/20 bg-blue-500/10"
                      disabled
                    >
                      Current Plan
                    </Button>
                  ) : (
                    <>
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
                      <div className="relative py-1">
                        <div className="absolute inset-0 flex items-center">
                          <span className="w-full border-t border-gray-700" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                          <span className="bg-black px-2 text-gray-400">
                            Or
                          </span>
                        </div>
                      </div>

                      {/* Razorpay Payment Button */}
                      <RazorpayPayment
                        planType="pro"
                        onSuccess={handlePaymentSuccess}
                        onError={handlePaymentError}
                        onPaymentStart={() => setOpen(false)}
                      />
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Pro Yearly Plan */}
            <Card className="relative border-2 border-yellow-500 hover:border-yellow-400 transition-all duration-300 hover:shadow-xl bg-black/40 backdrop-blur-md flex flex-col h-full shadow-lg shadow-yellow-500/20">
              <div className="absolute -top-2 right-2">
                <Badge className="bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-500 hover:from-yellow-400 hover:via-yellow-300 hover:to-yellow-400 text-xs py-0.5 px-1.5 text-black font-bold shadow-md shadow-yellow-500/50">
                  <Sparkles className="h-2.5 w-2.5 mr-0.5" />
                  BEST VALUE
                </Badge>
              </div>

              <CardHeader className="space-y-0 pb-1 pt-3 px-3 flex-shrink-0 relative z-10">
                <div className="flex items-center gap-1.5 mb-1">
                  <Badge
                    variant="secondary"
                    className="bg-blue-100 text-blue-700 hover:bg-blue-200 text-xs py-0"
                  >
                    PRO
                  </Badge>
                  <Badge
                    variant="outline"
                    className="bg-blue-100 text-blue-700 border-blue-300 text-xs py-0"
                  >
                    Early-Bird
                  </Badge>
                </div>
                <h3 className="text-lg font-bold text-white">Yearly Plan</h3>
                <p className="text-gray-400 text-xs">
                  Best value for power users
                </p>
              </CardHeader>

              <CardContent className="space-y-4 px-3 pb-3 flex flex-col flex-grow min-h-0 relative z-10">
                <div>
                  <p className="text-2xl font-bold text-white">
                    ₹999
                    <span className="text-sm font-normal text-gray-400">
                      /year
                    </span>
                  </p>
                  <p className="text-xs text-gray-400 line-through mt-1">
                    Regular: ₹1,999/year
                  </p>
                  <p className="text-xs text-blue-400 font-medium mt-1">
                    Save ₹1,189 per year!
                  </p>
                </div>

                <div className="bg-blue-500/20 p-2.5 rounded-lg border border-blue-500/50">
                  <div className="flex items-baseline gap-2">
                    <p className="text-base font-bold text-blue-300">
                      {userData?.isFirstTimeUser
                        ? "530 Credits"
                        : "480 Credits"}
                    </p>
                    {userData?.isFirstTimeUser && (
                      <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-black text-xs font-bold px-2 py-0.5 animate-pulse">
                        +50 BONUS
                      </Badge>
                    )}
                  </div>
                  {userData?.isFirstTimeUser && (
                    <p className="text-xs text-blue-200 mt-1">
                      (480 + 50 bonus credits)
                    </p>
                  )}
                  <p className="text-xs text-blue-200">
                    No daily limit - use anytime
                  </p>
                  <p className="text-xs text-blue-400 mt-1 font-medium">
                    (40 credits × 12 months)
                  </p>
                  {userData?.isFirstTimeUser && (
                    <div className="mt-2 p-1.5 bg-yellow-500/20 border border-yellow-400/50 rounded">
                      <p className="text-xs font-bold text-yellow-300">
                        🎉{" "}
                        <span className="text-yellow-400 text-sm font-extrabold">
                          +50
                        </span>{" "}
                        EXTRA CREDITS FOR FIRST-TIME USERS!
                      </p>
                    </div>
                  )}
                </div>

                <div className="space-y-2 flex-grow">
                  {[
                    userData?.isFirstTimeUser
                      ? "530 credits per year (480 + 50 bonus)"
                      : "480 credits per year (use anytime)",
                    "Access to all 250+ premium fonts",
                    "Priority support",
                    "Advanced customization options",
                  ].map((feature) => (
                    <div key={feature} className="flex items-center gap-1.5">
                      <Check className="h-3 w-3 text-blue-500 flex-shrink-0" />
                      <span className="text-gray-300 text-xs">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Payment Options */}
                <div className="mt-auto pt-2 space-y-2.5 flex-shrink-0">
                  {loadingUserData ? (
                    <Button
                      variant="outline"
                      className="w-full h-10 text-sm border-yellow-500 text-white bg-yellow-500/10 flex items-center justify-center"
                      disabled
                    >
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Loading...
                    </Button>
                  ) : userData?.currentPlanType === "pro_yearly" ? (
                    <Button
                      variant="outline"
                      className="w-full h-10 text-sm hover:scale-105 transition-transform border-yellow-500 text-white hover:bg-yellow-900/20 bg-yellow-500/10"
                      disabled
                    >
                      Current Plan
                    </Button>
                  ) : (
                    <>
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
                      <div className="relative py-1">
                        <div className="absolute inset-0 flex items-center">
                          <span className="w-full border-t border-gray-700" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                          <span className="bg-black px-2 text-gray-400">
                            Or
                          </span>
                        </div>
                      </div>

                      {/* Razorpay Payment Button - Yearly */}
                      <RazorpayPayment
                        planType="pro_yearly"
                        onSuccess={handlePaymentSuccess}
                        onError={handlePaymentError}
                        onPaymentStart={() => setOpen(false)}
                      />
                    </>
                  )}
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
