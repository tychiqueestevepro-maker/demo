import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only protect /app routes
  if (!pathname.startsWith("/app")) {
    return NextResponse.next();
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    // If Supabase is not configured, allow access (dev mode)
    return NextResponse.next();
  }

  // Check for session cookie or authorization header
  // Supabase stores auth in localStorage on client, so middleware
  // checks the sb-access-token cookie or falls back
  const accessToken = request.cookies.get("sb-access-token")?.value
    ?? request.cookies.get(`sb-${new URL(supabaseUrl).hostname.split(".")[0]}-auth-token`)?.value;

  // For SSR-protected routes, we rely on the client-side AuthProvider
  // to handle redirects. The middleware just ensures the route is reachable.
  // The real auth enforcement happens in AuthProvider and API routes.
  return NextResponse.next();
}

export const config = {
  matcher: ["/app/:path*"],
};
