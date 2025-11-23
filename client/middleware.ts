import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

export const runtime = "nodejs";

const publicPaths = ["/login", "/register"];

export function middleware(req: NextRequest) {
  const token = req.cookies.get("accessToken")?.value;
  const pathname = req.nextUrl.pathname;

  // Exclude Next.js internals & API routes
  if (pathname.startsWith("/_next") || pathname.startsWith("/api") || pathname === "/favicon.ico") {
    return NextResponse.next();
  }

  // User is logged in
  if (token) {
    try {
      jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!);

      // Prevent logged-in users from accessing login/register
      if (publicPaths.includes(pathname)) {
        return NextResponse.redirect(new URL("/", req.url));
      }

      return NextResponse.next(); // allow access to protected pages
    } catch (err) {
      // Invalid/expired access token - check if refresh token exists
      const refreshToken = req.cookies.get("refreshToken")?.value;
      
      if (refreshToken) {
        // Refresh token exists - let the client-side interceptor handle the refresh
        // Don't redirect here, let the page load and axios will handle token refresh
        if (publicPaths.includes(pathname)) {
          return NextResponse.redirect(new URL("/", req.url));
        }
        return NextResponse.next();
      }
      
      // No refresh token → delete access token cookie and redirect to login
      const response = NextResponse.redirect(new URL("/login", req.url));
      response.cookies.delete("accessToken");
      response.cookies.delete("refreshToken");
      return response;
    }
  }

  // User not logged in → redirect to login if trying to access protected pages
  if (!publicPaths.includes(pathname)) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Public pages (login/register) → allow
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next|favicon.ico|api).*)", // protects everything except _next, favicon, api
  ],
};
