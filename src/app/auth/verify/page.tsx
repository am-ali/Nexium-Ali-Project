'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

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
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-lg">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-gray-900">Check Your Email</h2>
          <p className="mt-2 text-sm text-gray-600">
            We&apos;ve sent you a magic link. Click the link in your email to sign in.
          </p>
          {countdown > 0 && (
            <p className="mt-4 text-sm text-gray-500">
              Redirecting to dashboard in {countdown} seconds after verification...
            </p>
          )}
        </div>
        <div className="mt-8 flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
        <button
          onClick={() => router.push('/')}
          className="mt-4 w-full text-sm text-gray-600 hover:text-gray-900"
        >
          Return to home page
        </button>
      </div>
    </div>
  );
}