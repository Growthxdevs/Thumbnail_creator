import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    return NextResponse.json({
      success: true,
      auth: {
        hasSession: !!session,
        user: session?.user
          ? {
              id: session.user.id,
              email: session.user.email,
              name: session.user.name,
              credits: session.user.credits,
              isPro: session.user.isPro,
            }
          : null,
        sessionExpires: session?.expires,
      },
      config: {
        nextAuthUrl: process.env.NEXTAUTH_URL,
        hasSecret: !!process.env.NEXTAUTH_SECRET,
        hasGoogleClientId: !!process.env.GOOGLE_CLIENT_ID,
        hasGoogleClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
        nodeEnv: process.env.NODE_ENV,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Auth debug error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Auth debug failed",
        message: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
