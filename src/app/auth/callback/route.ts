import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const type = searchParams.get('type');

  if (!code) {
    return NextResponse.redirect(new URL('/auth?error=no_code', request.url));
  }

  const supabase = await createClient();
  
  try {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (error) {
      console.error('Auth error:', error);
      return NextResponse.redirect(new URL('/auth?error=auth_failed', request.url));
    }

    // Check if email is verified
    if (data.user && !data.user.email_confirmed_at) {
      return NextResponse.redirect(new URL('/auth/verify?unconfirmed=true', request.url));
    }

    // If email is confirmed, redirect to dashboard
    return NextResponse.redirect(new URL('/dashboard', request.url));
    
  } catch (error) {
    console.error('Session exchange error:', error);
    return NextResponse.redirect(new URL('/auth?error=session_failed', request.url));
  }
}