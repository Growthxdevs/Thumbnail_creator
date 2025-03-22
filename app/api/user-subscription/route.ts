import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { db } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email || "" },
      select: { isPro: true },
    });

    return NextResponse.json({ isPro: user?.isPro || false });
  } catch (error) {
    console.error("Error fetching subscription:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
