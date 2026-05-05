import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest): NextResponse {
  const token = request.cookies.get("adminToken")?.value;
  const { pathname } = request.nextUrl;

  const protectedPaths: string[] = ["/dashboard"];
  const authPaths: string[] = ["/signin", "/signup"];

  const isProtected = protectedPaths.some((p) => pathname.startsWith(p));
  const isAuthPage = authPaths.some((p) => pathname.startsWith(p));


  if (pathname === "/") {
    if (!token) {
      return NextResponse.redirect(new URL("/signin", request.url));
    }
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (isProtected && !token) {
    return NextResponse.redirect(new URL("/signin", request.url));
  }

  if (isAuthPage && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/dashboard/:path*", "/signin", "/signup"],
};