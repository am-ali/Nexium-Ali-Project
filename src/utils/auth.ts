import { createClient } from '@/lib/supabase/server';

export async function sendMagicLink(email: string) {
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
            emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
        },
    });
    if (error) throw new Error(error.message);
}

export async function getSession() {
    const supabase = await createClient();
    try {
        const { data: { session } } = await supabase.auth.getSession();
        return session;
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
}

export const getUser = async () => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

export const signOut = async () => {
  const supabase = await createClient();
  await supabase.auth.signOut();
};