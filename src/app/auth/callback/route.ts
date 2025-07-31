import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const type = searchParams.get('type');

  console.log('Auth callback received:', { code: !!code, type });

  if (!code) {
    console.error('No code provided in callback');
    return NextResponse.redirect(new URL('/auth?error=no_code', request.url));
  }

  const supabase = await createClient();
  
  try {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (error) {
      console.error('Auth exchange error:', error);
      return NextResponse.redirect(new URL('/auth?error=auth_failed', request.url));
    }

    if (!data.user) {
      console.error('No user data received');
      return NextResponse.redirect(new URL('/auth?error=no_user', request.url));
    }

    console.log('User data:', {
      id: data.user.id,
      email: data.user.email,
      email_confirmed_at: data.user.email_confirmed_at,
      confirmed_at: data.user.confirmed_at
    });

    // STRICT CHECK: Email must be confirmed
    if (!data.user.email_confirmed_at && !data.user.confirmed_at) {
      console.log('Email not confirmed, redirecting to verify');
      return NextResponse.redirect(new URL('/auth/verify?unconfirmed=true', request.url));
    }

    // Additional security: Check if this is a signup confirmation
    if (type === 'signup' || type === 'email_change') {
      console.log('Email confirmation successful, redirecting to dashboard');
    }

    // If email is confirmed, redirect to dashboard
    console.log('User authenticated successfully, redirecting to dashboard');
    return NextResponse.redirect(new URL('/dashboard', request.url));
    
  } catch (error) {
    console.error('Session exchange error:', error);
    return NextResponse.redirect(new URL('/auth?error=session_failed', request.url));
  }
}