"use client";
import Link from "next/link";
import { useSession } from "next-auth/react";
import UserMenu from "./user-menu";
import LoginButton from "./login-button";

const TopBar = () => {
  const { data: session, status } = useSession();

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-black/30">
      <div className="flex h-16 items-center justify-between px-4">
        <div className="mr-4">
          <Link
            href="/"
            className="text-2xl font-extrabold text-white font-dancing"
          >
            Thumbnail Creator
          </Link>
        </div>

        <div className="flex items-center space-x-4">
          {status === "loading" ? (
            <div className="h-8 w-8 rounded-full bg-gray-700 animate-pulse" />
          ) : session ? (
            <UserMenu />
          ) : (
            <LoginButton />
          )}
        </div>
      </div>
    </header>
  );
};

export default TopBar;
