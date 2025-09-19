import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    // Only allow authenticated users to access this debug endpoint
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check environment variables (without exposing sensitive values)
    const envCheck = {
      // Database
      DATABASE_URL: process.env.DATABASE_URL ? "✅ Set" : "❌ Missing",

      // NextAuth
      NEXTAUTH_URL: process.env.NEXTAUTH_URL ? "✅ Set" : "❌ Missing",
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? "✅ Set" : "❌ Missing",

      // Google OAuth
      GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? "✅ Set" : "❌ Missing",
      GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET
        ? "✅ Set"
        : "❌ Missing",

      // Other APIs
      REMOVE_BG_API_KEY: process.env.REMOVE_BG_API_KEY
        ? "✅ Set"
        : "❌ Missing",
      HUGGINGFACE_API_KEY: process.env.HUGGINGFACE_API_KEY
        ? "✅ Set"
        : "❌ Missing",

      // Environment info
      NODE_ENV: process.env.NODE_ENV || "❌ Missing",
      VERCEL: process.env.VERCEL ? "✅ Vercel" : "❌ Not Vercel",
      VERCEL_ENV: process.env.VERCEL_ENV || "❌ Missing",

      // Timestamp
      timestamp: new Date().toISOString(),
      userEmail: session.user.email,
    };

    return NextResponse.json(envCheck);
  } catch (error) {
    console.error("Error in env debug endpoint:", error);
    return NextResponse.json(
      {
        error: "Server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
