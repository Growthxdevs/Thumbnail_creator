import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    // Test database connection
    const userCount = await db.user.count();
    const accountCount = await db.account.count();
    const sessionCount = await db.session.count();

    return NextResponse.json({
      success: true,
      database: {
        userCount,
        accountCount,
        sessionCount,
        connection: "✅ Connected",
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Database connection error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Database connection failed",
        message: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
