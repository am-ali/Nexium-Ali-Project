'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { EnvelopeIcon, SparklesIcon } from '@heroicons/react/24/outline';

export default function VerifyPage() {
  const router = useRouter();
  const supabase = createClient();
  const [countdown, setCountdown] = useState(60);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((current) => {
        if (current <= 1) {
          clearInterval(timer);
          return 0;
        }
        return current - 1;
      });
    }, 1000);

    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.push('/dashboard');
      }
    };

    // Check for session every 2 seconds
    const sessionChecker = setInterval(checkSession, 2000);

    return () => {
      clearInterval(timer);
      clearInterval(sessionChecker);
    };
  }, [router, supabase.auth]);

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 to-blue-900/20 pointer-events-none" />
      
      <div className="relative z-10 max-w-md w-full">
        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-8 shadow-xl">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                <EnvelopeIcon className="h-8 w-8 text-white" />
              </div>
            </div>
            
            <h2 className="text-3xl font-bold text-white mb-4">Check Your Email</h2>
            <p className="text-slate-400 mb-6">
              We&apos;ve sent you a magic link. Click the link in your email to sign in.
            </p>
            
            {countdown > 0 && (
              <div className="bg-slate-700/30 rounded-lg p-3 mb-6 border border-slate-600/30">
                <p className="text-sm text-slate-300">
                  Redirecting to dashboard in <span className="font-semibold text-purple-400">{countdown}</span> seconds after verification...
                </p>
              </div>
            )}
          </div>
          
          <div className="flex justify-center mb-6">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-purple-500 border-t-transparent"></div>
          </div>
          
          <button
            onClick={() => router.push('/')}
            className="w-full text-sm text-slate-400 hover:text-slate-300 transition-colors"
          >
            Return to home page
          </button>
        </div>
      </div>
    </div>
  );
}