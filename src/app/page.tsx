'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

export default function HomePage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const supabase = createClient();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { error } = await supabase.auth.signInWithOtp({
                email,
                options: {
                    emailRedirectTo: `${window.location.origin}/auth/callback`,
                },
            });

            if (error) throw error;

            toast.success('Check your email for the login link!');
            router.push('/auth/verify');
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Failed to send login link');
            setError(err instanceof Error ? err.message : 'Failed to send login link');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <h1 className="text-4xl font-bold mb-4">Welcome to Resume AI</h1>
            <p className="text-lg mb-8">Tailor your resume effortlessly for your dream job!</p>
            <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4">
                <Input 
                    placeholder="Enter your email to get started" 
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                {error && (
                    <p className="text-red-500 text-sm">{error}</p>
                )}
                <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={loading}
                >
                    {loading ? 'Sending link...' : 'Get Started'}
                </Button>
            </form>
        </div>
    );
}