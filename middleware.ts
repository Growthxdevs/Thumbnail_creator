import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const url = req.nextUrl.clone();
    const isAuthenticated = !!req.nextauth.token; // Check if user is authenticated

    // if (!isAuthenticated) {
    //   //   if (req.nextUrl.pathname !== "/auth/signin") {
    //   //     url.pathname = "/auth/signin"; // Redirect unauthenticated users to sign-in
    //   //     return NextResponse.redirect(url);
    //   //   }
    //   // } else {
    //   // if (req.nextUrl.pathname === "/auth/signin") {
    //   //   url.pathname = "/editor"; // Redirect authenticated users to editor
    //   //   return NextResponse.redirect(url);
    //   // }
    // }

    return NextResponse.next(); // Continue as normal
  },
  {
    pages: {
      signIn: "/", // Define sign-in page
    },
  }
);

export const config = {
  matcher: ["/protected/:path*", "/editor/:path*"], // Include `/` in protected routes
};
