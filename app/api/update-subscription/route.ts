import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { subscriptionId } = await req.json();

    await db.user.update({
      where: { email: session.user.email || "" },
      data: { isPro: true, subscriptionId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating subscription:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
