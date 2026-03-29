import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip static files and API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.') // static files
  ) {
    return NextResponse.next();
  }

  // Check for Supabase auth cookie
  // Supabase stores auth tokens in cookies prefixed with sb-<project-ref>-auth-token
  const allCookies = request.cookies.getAll();
  const authCookie = allCookies.find((c) => c.name.includes('auth-token'));
  const hasSession = !!authCookie?.value;

  const isLoginPage = pathname === '/login';
  const isDashboard = pathname.startsWith('/dashboard');

  // If trying to access dashboard without session, redirect to login
  if (isDashboard && !hasSession) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // If on login page with session, redirect to dashboard
  if (isLoginPage && hasSession) {
    const dashboardUrl = new URL('/dashboard', request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/login'],
};
