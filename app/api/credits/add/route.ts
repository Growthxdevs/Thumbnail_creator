import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Parse the request body
  let amount: number;
  try {
    const body = await req.json();
    amount = parseInt(body.amount);
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }

  if (!amount || amount < 1) {
    return NextResponse.json(
      { error: "Invalid credit amount" },
      { status: 400 }
    );
  }

  const user = await db.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Add credits
  const updatedUser = await db.user.update({
    where: { email: session.user.email },
    data: { credits: user.credits + amount },
  });

  return NextResponse.json({
    success: true,
    newCredits: updatedUser.credits,
  });
}
