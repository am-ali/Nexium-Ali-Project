'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { SparklesIcon } from '@heroicons/react/24/outline';

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
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 to-blue-900/20 pointer-events-none" />
            
            <div className="relative z-10 w-full max-w-md px-4">
                <div className="text-center mb-8">
                    <div className="flex justify-center mb-6">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                            <SparklesIcon className="h-8 w-8 text-white" />
                        </div>
                    </div>
                    <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                        Welcome to Resume AI
                    </h1>
                    <p className="text-lg text-slate-400">
                        Tailor your resume effortlessly for your dream job!
                    </p>
                </div>
                
                <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-8 shadow-xl">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <Input 
                                placeholder="Enter your email to get started" 
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="bg-slate-700/50 border-slate-600/50 text-white placeholder-slate-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                required
                            />
                        </div>
                        {error && (
                            <p className="text-red-400 text-sm">{error}</p>
                        )}
                        <Button 
                            type="submit" 
                            className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600" 
                            disabled={loading}
                        >
                            {loading ? 'Sending link...' : 'Get Started'}
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
}