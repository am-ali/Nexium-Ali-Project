import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request): Promise<NextResponse> {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.redirect(new URL('/auth', request.url));
  }

  const supabase = await createClient();
  await supabase.auth.exchangeCodeForSession(code);

  return NextResponse.redirect(new URL('/dashboard', request.url));
}