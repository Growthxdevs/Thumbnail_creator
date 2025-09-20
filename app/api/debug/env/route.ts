import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Check environment variables (without exposing sensitive values)
    const envCheck = {
      // Database
      DATABASE_URL: process.env.DATABASE_URL ? "✅ Set" : "❌ Missing",

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
      authStatus: "Auth removed - no authentication required",
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
