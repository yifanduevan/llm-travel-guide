import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const isTripsPath = request.nextUrl.pathname.startsWith("/trips");
  const hasAuth = request.cookies.has("auth");

  if (isTripsPath && !hasAuth) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirectTo", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/trips/:path*"],
};
