"use client";

import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertCircle, RefreshCw } from "lucide-react";
import Link from "next/link";

export default function AuthError() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const getErrorMessage = (error: string | null) => {
    switch (error) {
      case "OAuthAccountNotLinked":
        return {
          title: "Account Not Linked",
          description:
            "This email is already associated with a different sign-in method. Please try signing in with the original method or contact support.",
          action: "Try signing in again with Google",
        };
      case "Configuration":
        return {
          title: "Configuration Error",
          description:
            "There is a problem with the server configuration. Please try again later.",
          action: "Contact support",
        };
      case "AccessDenied":
        return {
          title: "Access Denied",
          description:
            "You denied access to the application. Please try again and grant the necessary permissions.",
          action: "Try signing in again",
        };
      default:
        return {
          title: "Authentication Error",
          description:
            "An unexpected error occurred during authentication. Please try again.",
          action: "Try again",
        };
    }
  };

  const errorInfo = getErrorMessage(error);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-black p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <AlertCircle className="h-6 w-6 text-red-600" />
          </div>
          <CardTitle className="text-2xl">{errorInfo.title}</CardTitle>
          <CardDescription>{errorInfo.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-4">
              Error:{" "}
              <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                {error}
              </code>
            </p>
          </div>

          <div className="space-y-2">
            <Button asChild className="w-full">
              <Link href="/api/auth/signin">
                <RefreshCw className="mr-2 h-4 w-4" />
                {errorInfo.action}
              </Link>
            </Button>

            <Button variant="outline" asChild className="w-full">
              <Link href="/">Go to Homepage</Link>
            </Button>
          </div>

          {error === "OAuthAccountNotLinked" && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm text-yellow-800">
                <strong>Tip:</strong> If you previously signed in with GitHub,
                try clearing your browser data or using an incognito window.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
