"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";

export default function LoginButton() {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      await signIn("google");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleClick}
      disabled={isLoading}
      aria-label="Sign in with Google"
      className="rounded-full h-9 px-3 bg-white text-gray-900 border border-gray-300 shadow-sm hover:bg-gray-50 hover:border-gray-400 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 transition-colors dark:bg-white dark:text-gray-900"
    >
      {/* Google G logo */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 533.5 544.3"
        className="mr-2 h-4 w-4"
        aria-hidden="true"
      >
        <path
          fill="#EA4335"
          d="M533.5 278.4c0-18.5-1.6-37-5-54.9H272.1v103.9h147.1c-6.1 33.5-25.2 61.9-53.7 81v67.2h86.8c50.8-46.8 81.2-115.8 81.2-197.2z"
        />
        <path
          fill="#34A853"
          d="M272.1 544.3c72.9 0 134.2-24.1 178.9-65.6l-86.8-67.2c-24.1 16.2-55 25.7-92.1 25.7-70.7 0-130.7-47.7-152.2-111.7h-90.6v69.9c44.9 89.1 136.6 148.9 242.8 148.9z"
        />
        <path
          fill="#4A90E2"
          d="M119.9 325.5c-10.2-30.7-10.2-63.9 0-94.6v-69.9h-90.6C2.8 206.1 0 230.9 0 256s2.8 49.9 29.3 95.1l90.6-69.6z"
        />
        <path
          fill="#FBBC05"
          d="M272.1 106.8c39.7-.6 77.8 14.3 106.9 41.9l80-80C412.7 25.5 343.9-1.1 272.1 0 165.9 0 74.2 59.8 29.3 148.9l90.6 69.9c21.5-64 81.5-112 152.2-112z"
        />
      </svg>
      {isLoading ? "Signing in…" : "Sign in with Google"}
    </Button>
  );
}
