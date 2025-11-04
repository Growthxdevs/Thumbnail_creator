"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useCreditStore } from "@/stores/credit-store";
import { useCreditInit } from "@/hooks/use-credit-init";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { LogOut, CreditCard, Sparkles, Crown, Zap } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Lottie from "lottie-react";
import fireAnimation from "@/public/assets/animations/fire-animation.json";

export default function UserMenu() {
  const { data: session } = useSession();
  const router = useRouter();
  const { credits } = useCreditStore();
  useCreditInit(); // Initialize credits from session

  if (!session) return null;

  const user = session.user;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center space-x-2 rounded-full p-1 hover:bg-gray-800 transition-colors relative">
          <div className="relative flex flex-col items-center">
            <Avatar className={`h-8 w-8 `}>
              <AvatarImage src={user?.image || ""} alt={user?.name || ""} />
              <AvatarFallback>
                {user?.name?.charAt(0) || user?.email?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            {user?.isPro && (
              <Crown className="absolute -top-1 -right-1 h-3 w-3 text-yellow-400 animate-crown-glow" />
            )}
            {user?.isPro && (
              <div
                className="absolute -top-4 -right-3.5 w-16 h-12 pointer-events-none overflow-hidden"
                style={{ zIndex: -10 }}
              >
                <Lottie
                  animationData={fireAnimation}
                  loop={true}
                  autoplay={true}
                  style={{ width: "100%", height: "100%", zIndex: -10 }}
                />
              </div>
            )}
          </div>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72 relative z-10">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user?.name}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user?.email}
            </p>
            <div className="flex items-center space-x-2 mt-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge
                      variant={user?.isPro ? "default" : "secondary"}
                      className="cursor-help"
                    >
                      {credits} credits
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Available credits for thumbnail generation</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              {user?.isPro && (
                <Badge
                  variant="default"
                  className="bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600 bg-[length:200%_100%] animate-gradient-x text-white font-semibold shadow-lg border-0"
                >
                  <Crown className="h-3 w-3 mr-1.5" />
                  <span className="bg-gradient-to-r from-yellow-200 to-yellow-300 bg-clip-text text-transparent font-bold">
                    PRO
                  </span>
                  <Sparkles className="h-3 w-3 ml-1.5 animate-pulse" />
                </Badge>
              )}
              {user?.isPro && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center justify-center w-8 h-6 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-md cursor-help">
                        <Zap className="h-4 w-4 text-white animate-pulse" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Unlimited Fast Generation</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {/* <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
            </TooltipTrigger>
            <TooltipContent>
              <p>View and edit your profile</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider> */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuItem onClick={() => router.push("/billing")}>
                <CreditCard className="mr-2 h-4 w-4" />
                <span>Billing</span>
              </DropdownMenuItem>
            </TooltipTrigger>
            <TooltipContent>
              <p>Manage your subscription and billing</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <DropdownMenuSeparator />
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuItem
                onClick={() => signOut({ callbackUrl: "/" })}
                className="text-red-600 focus:text-red-600"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </TooltipTrigger>
            <TooltipContent>
              <p>Sign out of your account</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
