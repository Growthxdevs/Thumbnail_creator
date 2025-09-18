import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const url = req.nextUrl.clone();
    const isAuthenticated = !!req.nextauth.token;

    // If user is authenticated and trying to access sign-in page, redirect to editor
    if (isAuthenticated && req.nextUrl.pathname === "/auth/signin") {
      url.pathname = "/editor";
      return NextResponse.redirect(url);
    }

    return NextResponse.next();
  },
  {
    pages: {
      signIn: "/auth/signin",
    },
  }
);

export const config = {
  matcher: ["/editor/:path*", "/auth/signin"],
};
