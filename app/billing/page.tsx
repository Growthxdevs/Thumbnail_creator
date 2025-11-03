"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import AuthGuard from "@/components/auth-guard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, Sparkles, X } from "lucide-react";
import PlanModal from "@/components/plan-modal";
import RazorpayPayment from "@/components/razorpay-payment";

export default function BillingPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [userData, setUserData] = useState<{
    isPro?: boolean;
    currentPlanType?: "free" | "pro" | "pro_yearly";
    credits?: number;
    subscriptionId?: string | null;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch("/api/user-subscription");
        if (response.ok) {
          const data = await response.json();
          setUserData(data);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      fetchUserData();
    }
  }, [session]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-black p-4 sm:p-8">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <Button
                variant="ghost"
                onClick={() => router.back()}
                className="mb-4 text-white hover:text-gray-300"
              >
                ← Back
              </Button>
              <h1 className="text-4xl font-bold text-white mb-2">Billing & Subscription</h1>
              <p className="text-gray-400">
                Manage your subscription, credits, and billing information
              </p>
            </div>

            {/* Current Plan Card */}
            <Card className="mb-6 bg-white/5 backdrop-blur-md border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  Current Plan
                  {userData?.isPro && (
                    <Badge className="bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600 bg-[length:200%_100%] animate-gradient-x text-white font-semibold border-0">
                      <Crown className="h-3 w-3 mr-1.5" />
                      PRO
                      <Sparkles className="h-3 w-3 ml-1.5 animate-pulse" />
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Available Credits</p>
                    <p className="text-2xl font-bold text-white mt-1">
                      {userData?.credits ?? 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Subscription Status</p>
                    <p className="text-lg font-semibold text-white mt-1">
                      {userData?.isPro
                        ? userData?.currentPlanType === "pro_yearly"
                          ? "Yearly Plan"
                          : "Monthly Plan"
                        : "Free Plan"}
                    </p>
                  </div>
                </div>
                {userData?.subscriptionId && (
                  <div>
                    <p className="text-gray-400 text-sm">Subscription ID</p>
                    <p className="text-sm text-white mt-1 font-mono">
                      {userData.subscriptionId}
                    </p>
                  </div>
                )}
                {!userData?.isPro && (
                  <div className="pt-4 border-t border-white/10">
                    <PlanModal />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Pricing Plans */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5 items-stretch mb-8">
              {/* Free Plan */}
              <Card className="relative border border-gray-700 hover:border-gray-600 transition-all duration-300 hover:shadow-md bg-black/40 backdrop-blur-md flex flex-col h-full">
                <CardHeader className="space-y-0 pb-1 pt-3 px-3 flex-shrink-0">
                  <Badge variant="secondary" className="w-fit mb-1 text-xs">
                    FREE
                  </Badge>
                  <CardTitle className="text-lg font-bold text-white">
                    Starter
                  </CardTitle>
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
                        <span className="text-gray-400 text-xs">{limitation}</span>
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
                      {userData?.currentPlanType === "free" ? "Current Plan" : "Free Plan"}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Monthly Plan */}
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
                  <CardTitle className="text-lg font-bold text-white">
                    Monthly Plan
                  </CardTitle>
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
                    <p className="text-base font-bold text-blue-300">250 Credits</p>
                    <p className="text-xs text-blue-200">No daily limit - use anytime</p>
                  </div>

                  <div className="space-y-2 flex-grow">
                    {[
                      "250 credits per month (use anytime)",
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

                  <div className="mt-auto pt-2 flex-shrink-0">
                    {userData?.currentPlanType === "pro" ? (
                      <Button
                        variant="outline"
                        className="w-full h-10 text-sm hover:scale-105 transition-transform border-blue-500 text-white hover:bg-blue-900/20 bg-blue-500/10"
                        disabled
                      >
                        Current Plan
                      </Button>
                    ) : (
                      <RazorpayPayment
                        planType="pro"
                        onSuccess={(paymentId) => {
                          console.log("Payment successful:", paymentId);
                          // Refresh user data
                          fetch("/api/user-subscription")
                            .then((res) => res.json())
                            .then((data) => setUserData(data))
                            .catch(console.error);
                        }}
                        onError={(error) => {
                          console.error("Payment error:", error);
                        }}
                      />
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Yearly Plan */}
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
                  <CardTitle className="text-lg font-bold text-white">
                    Yearly Plan
                  </CardTitle>
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
                    <p className="text-base font-bold text-blue-300">3,000 Credits</p>
                    <p className="text-xs text-blue-200">No daily limit - use anytime</p>
                    <p className="text-xs text-blue-400 mt-1 font-medium">
                      (250 credits × 12 months)
                    </p>
                  </div>

                  <div className="space-y-2 flex-grow">
                    {[
                      "3,000 credits per year (use anytime)",
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

                  <div className="mt-auto pt-2 flex-shrink-0">
                    {userData?.currentPlanType === "pro_yearly" ? (
                      <Button
                        variant="outline"
                        className="w-full h-10 text-sm hover:scale-105 transition-transform border-yellow-500 text-white hover:bg-yellow-900/20 bg-yellow-500/10"
                        disabled
                      >
                        Current Plan
                      </Button>
                    ) : (
                      <RazorpayPayment
                        planType="pro_yearly"
                        onSuccess={(paymentId) => {
                          console.log("Payment successful:", paymentId);
                          // Refresh user data
                          fetch("/api/user-subscription")
                            .then((res) => res.json())
                            .then((data) => setUserData(data))
                            .catch(console.error);
                        }}
                        onError={(error) => {
                          console.error("Payment error:", error);
                        }}
                      />
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
    </AuthGuard>
  );
}

