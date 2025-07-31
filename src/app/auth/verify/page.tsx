'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { createClient } from '@/lib/supabase/client';
import { EnvelopeIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';

// Separate component that uses useSearchParams
function VerifyContent() {
  const router = useRouter();
  const supabase = createClient();
  const [countdown, setCountdown] = useState(60);
  const [isResending, setIsResending] = useState(false);
  
  // This is safer - get URL params without useSearchParams
  const [isUnconfirmed, setIsUnconfirmed] = useState(false);

  useEffect(() => {
    // Check URL params on client side
    const urlParams = new URLSearchParams(window.location.search);
    setIsUnconfirmed(urlParams.get('unconfirmed') === 'true');
  }, []);

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
      if (session?.user?.email_confirmed_at) {
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

  const handleResendEmail = async () => {
    setIsResending(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) {
        const { error } = await supabase.auth.resend({
          type: 'signup',
          email: user.email,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          }
        });
        
        if (error) throw error;
        // Reset countdown
        setCountdown(60);
      }
    } catch (error) {
      console.error('Error resending email:', error);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 to-blue-900/20 pointer-events-none" />
      
      <div className="relative z-10 max-w-md w-full">
        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-8 shadow-xl">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                isUnconfirmed 
                  ? 'bg-gradient-to-br from-yellow-500 to-orange-500' 
                  : 'bg-gradient-to-br from-purple-500 to-blue-500'
              }`}>
                {isUnconfirmed ? (
                  <ExclamationTriangleIcon className="h-8 w-8 text-white" />
                ) : (
                  <EnvelopeIcon className="h-8 w-8 text-white" />
                )}
              </div>
            </div>
            
            <h2 className="text-3xl font-bold text-white mb-4">
              {isUnconfirmed ? 'Confirm Your Email' : 'Check Your Email'}
            </h2>
            <p className="text-slate-400 mb-6">
              {isUnconfirmed 
                ? 'Please check your email and click the confirmation link to verify your account.'
                : 'We\'ve sent you a magic link. Click the link in your email to sign in.'
              }
            </p>
            
            {countdown > 0 && !isUnconfirmed && (
              <div className="bg-slate-700/30 rounded-lg p-3 mb-6 border border-slate-600/30">
                <p className="text-sm text-slate-300">
                  Checking for verification... <span className="font-semibold text-purple-400">{countdown}</span>s
                </p>
              </div>
            )}

            {isUnconfirmed && (
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 mb-6">
                <p className="text-sm text-yellow-200">
                  Your email address needs to be verified before you can access the dashboard.
                </p>
              </div>
            )}
          </div>
          
          <div className="flex justify-center mb-6">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-purple-500 border-t-transparent"></div>
          </div>

          <div className="space-y-4">
            {(isUnconfirmed || countdown === 0) && (
              <Button
                onClick={handleResendEmail}
                disabled={isResending}
                variant="outline"
                className="w-full border-slate-600/50 text-slate-300 hover:bg-slate-700/50"
              >
                {isResending ? 'Sending...' : 'Resend confirmation email'}
              </Button>
            )}
            
            <button
              onClick={() => router.push('/')}
              className="w-full text-sm text-slate-400 hover:text-slate-300 transition-colors"
            >
              Return to home page
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Loading fallback component
function VerifyLoading() {
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
            
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-slate-700/50 rounded w-3/4 mx-auto"></div>
              <div className="h-4 bg-slate-700/50 rounded w-full"></div>
              <div className="h-4 bg-slate-700/50 rounded w-2/3 mx-auto"></div>
            </div>
            
            <div className="flex justify-center mt-6">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-purple-500 border-t-transparent"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main component with Suspense boundary
export default function VerifyPage() {
  return (
    <Suspense fallback={<VerifyLoading />}>
      <VerifyContent />
    </Suspense>
  );
}