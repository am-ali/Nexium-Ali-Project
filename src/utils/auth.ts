import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export async function sendMagicLink(email: string) {
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
            emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
        },
    });
    if (error) throw new Error(error.message);
}

export async function getSession() {
    const supabase = createClient();
    try {
        const { data: { session } } = await supabase.auth.getSession();
        return session;
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
}