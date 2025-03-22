"use client";
import { LogIn, LogOut, Settings, User, Star } from "lucide-react";
import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSubscriptionStatus } from "@/hooks/useSubscriptionStatus";

const TopBar = () => {
  const { data: session, status } = useSession();
  const { isPro, loading } = useSubscriptionStatus();

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-black/30">
      <div className="flex h-16 items-center px-4">
        <div className="mr-4">
          <Link
            href="/"
            className="text-2xl font-extrabold text-white font-dancing"
          >
            Thumbnail Creator
          </Link>
        </div>

        <div className="ml-auto flex items-center space-x-4">
          {status === "authenticated" ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all">
                  <AvatarImage
                    src={session.user?.image ?? undefined}
                    alt={session.user?.name ?? "Profile"}
                  />
                  <AvatarFallback>
                    {session.user?.name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 backdrop-blur-md bg-black/70 shadow-xl rounded-xl">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none text-white">
                      {session.user?.name}
                    </p>
                    <p className="text-xs leading-none text-gray-400">
                      {session.user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-white/10" />

                {/* Subscription Status */}
                <DropdownMenuItem className="text-gray-200 focus:bg-white/10 focus:text-white">
                  <Star
                    className={`mr-2 h-4 w-4 ${
                      isPro ? "text-yellow-400" : "text-gray-400"
                    }`}
                  />
                  <span>
                    {loading ? "Checking..." : isPro ? "Pro User" : "Free User"}
                  </span>
                </DropdownMenuItem>

                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuGroup>
                  <DropdownMenuItem className="text-gray-200 focus:bg-white/10 focus:text-white">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-gray-200 focus:bg-white/10 focus:text-white">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem
                  onSelect={() => signOut()}
                  className="text-red-400 focus:bg-white/10 focus:text-red-300"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              onClick={() => signIn("google")}
              className="bg-blue-500 text-white hover:bg-blue-600"
              variant={"secondary"}
            >
              <LogIn className="mr-2 h-4 w-4" />
              Sign in
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default TopBar;
