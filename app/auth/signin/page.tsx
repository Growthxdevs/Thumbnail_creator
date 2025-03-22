"use client";
import { signIn } from "next-auth/react";

export default function SignInPage() {
  return (
    <div className="h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md p-4 bg-white rounded-lg shadow">
        <h1 className="text-xl font-bold text-center mb-4">Sign In</h1>

        <button
          onClick={() => signIn("google")}
          className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Sign in with Google
        </button>
      </div>
    </div>
  );
}
