import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get('code');

    if (!code) {
      return NextResponse.redirect(new URL('/auth', request.url));
    }

    const supabase = await createClient();
    await supabase.auth.exchangeCodeForSession(code);

    return NextResponse.redirect(new URL('/dashboard', request.url));
  } catch (error) {
    console.error('Auth callback error:', error);
    return NextResponse.redirect(new URL('/auth?error=callback_failed', request.url));
  }
}