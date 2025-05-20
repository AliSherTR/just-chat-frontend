import { type NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get access_token from cookie
  const token = request.cookies.get("access_token")?.value;

  // Check if the user is trying to access auth pages
  const isAuthRoute = pathname === "/auth/login" || pathname === "/auth/signup";

  if (isAuthRoute) {
    // If user is already logged in and trying to access auth pages,
    // redirect them to the dashboard/home
    if (token) {
      return NextResponse.redirect(new URL("/messages", request.url));
    }
    // Allow access to auth pages for non-logged in users
    return NextResponse.next();
  }

  // For all other protected routes, check if user is authenticated
  if (!token) {
    // Redirect to login if no token
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  // Allow access to protected routes for authenticated users
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|api|favicon.ico).*)"], // Match all routes except Next.js internals
};
