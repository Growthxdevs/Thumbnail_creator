import { NextResponse } from "next/server";
import { getServerAuthSession } from "@/lib/auth-server";
import { getFastGenerationStatus } from "@/lib/fast-generation-utils";

export async function GET() {
  try {
    const session = await getServerAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const status = await getFastGenerationStatus(
      session.user.id,
      session.user.isPro || false
    );

    return NextResponse.json(status, { status: 200 });
  } catch (error) {
    console.error("Error fetching fast generation status:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

