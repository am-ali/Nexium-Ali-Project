import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import type { CookieOptions } from '@supabase/ssr';

export const runtime = 'nodejs';

export async function middleware(request: NextRequest): Promise<NextResponse> {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          // Set cookie in request
          request.cookies.set({
            name,
            value,
            ...options
          });

          // Create new response with updated cookies
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });

          // Set cookie in response
          response.cookies.set({
            name,
            value,
            ...options
          });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.delete(name);
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.delete(name);
        },
      },
    }
  );

  await supabase.auth.getSession();

  return response;
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/auth/callback',
  ],
};