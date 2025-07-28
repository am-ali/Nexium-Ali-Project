import { supabase } from '../lib/supabase';

export const sendMagicLink = async (email: string) => {
    const { error } = await supabase.auth.signIn({ email });
    if (error) throw new Error(error.message);
};

export const validateMagicLink = async (accessToken: string) => {
    const { user, error } = await supabase.auth.api.getUser(accessToken);
    if (error) throw new Error(error.message);
    return user;
};