import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    // Enhanced debugging for production
    console.log("Session check:", {
      hasSession: !!session,
      hasUser: !!session?.user,
      userEmail: session?.user?.email,
      timestamp: new Date().toISOString(),
      nodeEnv: process.env.NODE_ENV,
      nextAuthUrl: process.env.NEXTAUTH_URL,
    });

    if (!session || !session.user) {
      console.log("No session found, returning 401", {
        hasSession: !!session,
        hasUser: !!session?.user,
        sessionKeys: session ? Object.keys(session) : [],
      });
      return NextResponse.json(
        {
          error: "Unauthorized",
          debug: "No valid session found",
          timestamp: new Date().toISOString(),
        },
        { status: 401 }
      );
    }

    if (!session.user.email) {
      console.log("No user email in session");
      return NextResponse.json(
        {
          error: "Unauthorized",
          debug: "No user email in session",
        },
        { status: 401 }
      );
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email },
      select: { isPro: true },
    });

    console.log("User found:", {
      email: session.user.email,
      isPro: user?.isPro,
    });

    return NextResponse.json({ isPro: user?.isPro || false });
  } catch (error) {
    console.error("Error fetching subscription:", error);
    return NextResponse.json(
      {
        error: "Server error",
        debug: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
