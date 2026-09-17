import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Fast-path route guard. This only checks whether an accessToken cookie is
 * present — it does NOT verify the JWT signature (that requires the
 * server's secret). The actual authorization check happens on the backend
 * when the page's Server Component calls getCurrentUser(). This proxy
 * exists purely to redirect obviously-logged-out users before rendering,
 * not as the source of truth for auth.
 */
const PROTECTED_PATHS = ["/dashboard"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );

  if (!isProtected) {
    return NextResponse.next();
  }

  const hasSession = request.cookies.has("accessToken");

  if (!hasSession) {
    const loginUrl = new URL("/", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
