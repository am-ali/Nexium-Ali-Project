import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { CookieOptions } from '@supabase/ssr';
import type { ResponseCookie } from 'next/dist/compiled/@edge-runtime/cookies';

export async function createClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: async (name: string) => {
          const cookieStore = await cookies();
          return cookieStore.get(name)?.value;
        },
        set: async (name: string, value: string, options: CookieOptions) => {
          const cookieStore = await cookies();
          cookieStore.set({
            name,
            value,
            domain: options.domain,
            path: options.path,
            secure: options.secure,
            sameSite: options.sameSite,
            httpOnly: options.httpOnly,
            maxAge: options.maxAge,
            priority: options.priority,
          });
        },
        remove: async (name: string, options: CookieOptions) => {
          const cookieStore = await cookies();
          cookieStore.delete(name);
        },
      },
    }
  );
}