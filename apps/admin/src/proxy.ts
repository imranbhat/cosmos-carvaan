import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * Validate the Supabase session by decoding the JWT from cookies.
 * We parse the auth cookie and verify it contains a non-expired access token.
 */
async function validateSession(request: NextRequest): Promise<boolean> {
  const allCookies = request.cookies.getAll();
  const authCookie = allCookies.find((c) => c.name.includes('auth-token'));
  if (!authCookie?.value) return false;

  try {
    // Supabase stores auth data as a JSON-encoded cookie with access_token
    // Try to parse and validate the JWT is not expired
    let parsed: { access_token?: string; expires_at?: number } | null = null;

    // Cookie value may be base64-encoded JSON or raw JSON
    try {
      parsed = JSON.parse(authCookie.value);
    } catch {
      try {
        parsed = JSON.parse(Buffer.from(authCookie.value, 'base64').toString());
      } catch {
        return false;
      }
    }

    if (!parsed?.access_token) return false;

    // Check expiration if available
    if (parsed.expires_at && parsed.expires_at < Math.floor(Date.now() / 1000)) {
      return false;
    }

    // Verify the token is valid by calling Supabase auth.getUser
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseAnonKey) return false;

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: `Bearer ${parsed.access_token}` } },
    });

    const { data: { user }, error } = await supabase.auth.getUser();
    return !!user && !error;
  } catch {
    return false;
  }
}

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

  const isLoginPage = pathname === '/login';
  const isDashboard = pathname.startsWith('/dashboard');

  if (!isDashboard && !isLoginPage) {
    return NextResponse.next();
  }

  const hasValidSession = await validateSession(request);

  // If trying to access dashboard without valid session, redirect to login
  if (isDashboard && !hasValidSession) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // If on login page with valid session, redirect to dashboard
  if (isLoginPage && hasValidSession) {
    const dashboardUrl = new URL('/dashboard', request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/login'],
};
