import { NextResponse } from "next/server";
import { getServerAuthSession } from "@/lib/auth-server";
import { db } from "@/lib/prisma";
import { safeDbOperation } from "@/lib/db-utils";

export async function GET() {
  try {
    const session = await getServerAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const user = await safeDbOperation(async () => {
      return await db.user.findUnique({
        where: { id: session.user.id },
        select: {
          credits: true,
          isPro: true,
          subscriptionId: true,
          email: true,
          name: true,
        },
      });
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    console.error("Error fetching user subscription:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
