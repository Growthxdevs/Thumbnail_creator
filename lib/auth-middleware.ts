import { NextRequest, NextResponse } from "next/server";
import { getServerAuthSession } from "./auth-server";
import { Session } from "next-auth";

export function withAuth(
  handler: (req: NextRequest, session: Session) => Promise<NextResponse>
) {
  return async (req: NextRequest) => {
    try {
      const session = await getServerAuthSession();

      if (!session?.user?.id) {
        return NextResponse.json(
          { message: "Unauthorized - Please sign in to access this resource" },
          { status: 401 }
        );
      }

      return await handler(req, session);
    } catch (error) {
      console.error("Authentication middleware error:", error);
      return NextResponse.json(
        { message: "Authentication failed" },
        { status: 401 }
      );
    }
  };
}

export function requireAuth(
  handler: (req: NextRequest, session: Session) => Promise<NextResponse>
) {
  return withAuth(handler);
}
