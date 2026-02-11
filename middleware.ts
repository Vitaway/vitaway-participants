// Route-protection middleware
// Redirects unauthenticated visitors away from /dashboard/* to the login page
// Redirects authenticated visitors away from /auth/* to the dashboard

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const AUTH_ROUTES = ['/auth/login', '/auth/forgot-password', '/auth/reset-password', '/auth/invite'];
const PROTECTED_PREFIX = '/dashboard';
const TOKEN_KEY = 'vitaway_access_token';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(TOKEN_KEY)?.value;

  // For the mock implementation we also check localStorage via a custom header,
  // but since middleware runs on the edge we rely on a cookie instead.
  // The auth context should set this cookie alongside localStorage.
  // For now we do a lightweight check: if no cookie, treat as unauthenticated.

  const isProtected = pathname.startsWith(PROTECTED_PREFIX);
  const isAuthRoute = AUTH_ROUTES.some((r) => pathname.startsWith(r));

  // Unauthenticated user hitting a protected route → login
  if (isProtected && !token) {
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Authenticated user hitting an auth page → dashboard
  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/auth/:path*'],
};
