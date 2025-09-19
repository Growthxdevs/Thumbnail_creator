import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const url = req.nextUrl.clone();
    const isAuthenticated = !!req.nextauth.token;

    // If user is authenticated and trying to access sign-in, redirect to editor
    if (
      isAuthenticated &&
      req.nextUrl.pathname.startsWith("/api/auth/signin")
    ) {
      url.pathname = "/editor";
      return NextResponse.redirect(url);
    }

    return NextResponse.next();
  },
  {
    pages: {
      signIn: "/api/auth/signin/google",
    },
  }
);

export const config = {
  matcher: ["/editor/:path*", "/api/auth/signin/:path*"],
};
