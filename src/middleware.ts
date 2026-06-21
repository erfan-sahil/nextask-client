import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Auth tokens live on the API origin (httpOnly cookies on the backend port).
 * Next.js middleware cannot read those cookies, so server-side redirects here
 * would always send users back to /login even after a successful sign-in.
 * Protected routes are guarded client-side in AppShell via GET /auth/me.
 */
export function middleware(_request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
