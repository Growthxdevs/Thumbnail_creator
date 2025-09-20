"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Chrome } from "lucide-react";

export default function LoginButton() {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => signIn("google")}
      className="bg-white text-black hover:bg-gray-100"
    >
      <Chrome className="mr-2 h-4 w-4" />
      Sign in with Google
    </Button>
  );
}
