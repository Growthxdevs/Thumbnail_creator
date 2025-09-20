import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const showValues = searchParams.get("showValues") === "true";
    const isProduction = process.env.NODE_ENV === "production";

    // Check environment variables
    const envCheck = {
      // Database
      DATABASE_URL: showValues
        ? process.env.DATABASE_URL || "❌ Missing"
        : process.env.DATABASE_URL
        ? "✅ Set"
        : "❌ Missing",

      // NextAuth.js
      NEXTAUTH_URL: showValues
        ? process.env.NEXTAUTH_URL || "❌ Missing"
        : process.env.NEXTAUTH_URL
        ? "✅ Set"
        : "❌ Missing",
      NEXTAUTH_SECRET: showValues
        ? process.env.NEXTAUTH_SECRET || "❌ Missing"
        : process.env.NEXTAUTH_SECRET
        ? "✅ Set"
        : "❌ Missing",

      // Google OAuth
      GOOGLE_CLIENT_ID: showValues
        ? process.env.GOOGLE_CLIENT_ID || "❌ Missing"
        : process.env.GOOGLE_CLIENT_ID
        ? "✅ Set"
        : "❌ Missing",
      GOOGLE_CLIENT_SECRET: showValues
        ? process.env.GOOGLE_CLIENT_SECRET || "❌ Missing"
        : process.env.GOOGLE_CLIENT_SECRET
        ? "✅ Set"
        : "❌ Missing",

      // Other APIs
      REMOVE_BG_API_KEY: showValues
        ? process.env.REMOVE_BG_API_KEY || "❌ Missing"
        : process.env.REMOVE_BG_API_KEY
        ? "✅ Set"
        : "❌ Missing",
      HUGGINGFACE_API_KEY: showValues
        ? process.env.HUGGINGFACE_API_KEY || "❌ Missing"
        : process.env.HUGGINGFACE_API_KEY
        ? "✅ Set"
        : "❌ Missing",

      // Environment info
      NODE_ENV: process.env.NODE_ENV || "❌ Missing",
      VERCEL: process.env.VERCEL ? "✅ Vercel" : "❌ Not Vercel",
      VERCEL_ENV: process.env.VERCEL_ENV || "❌ Missing",

      // Timestamp
      timestamp: new Date().toISOString(),
      showValues: showValues,
      isProduction: isProduction,
      note: showValues
        ? isProduction
          ? "🚨 CRITICAL WARNING: Sensitive values exposed in PRODUCTION! This is a security risk!"
          : "⚠️ WARNING: Sensitive values are exposed! Only use this in development."
        : isProduction
        ? "Production mode: Add ?showValues=true to see actual values (SECURITY RISK!)"
        : "Add ?showValues=true to see actual values (development only)",
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
