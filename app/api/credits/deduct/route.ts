import { NextResponse } from "next/server";
import { getServerAuthSession } from "@/lib/auth-server";
import { db } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { amount } = await req.json();

    if (!amount || typeof amount !== "number" || amount <= 0) {
      return NextResponse.json(
        { message: "Valid amount is required" },
        { status: 400 }
      );
    }

    // Check if user has enough credits
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { credits: true },
    });

    if (!user || user.credits < amount) {
      return NextResponse.json(
        { message: "Insufficient credits" },
        { status: 400 }
      );
    }

    const updatedUser = await db.user.update({
      where: { id: session.user.id },
      data: {
        credits: {
          decrement: amount,
        },
      },
      select: {
        credits: true,
      },
    });

    return NextResponse.json(
      {
        message: "Credits deducted successfully",
        credits: updatedUser.credits,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deducting credits:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
