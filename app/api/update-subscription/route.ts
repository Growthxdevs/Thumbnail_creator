import { NextResponse } from "next/server";
import { getServerAuthSession } from "@/lib/auth-server";
import { db } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { isPro, subscriptionId } = await req.json();

    if (typeof isPro !== "boolean") {
      return NextResponse.json(
        { message: "isPro must be a boolean" },
        { status: 400 }
      );
    }

    const updatedUser = await db.user.update({
      where: { id: session.user.id },
      data: {
        isPro,
        subscriptionId: subscriptionId || null,
      },
      select: {
        isPro: true,
        subscriptionId: true,
        credits: true,
      },
    });

    return NextResponse.json(
      {
        message: "Subscription updated successfully",
        user: updatedUser,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating subscription:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
