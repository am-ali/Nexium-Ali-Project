'use client';

import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export function Header() {
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/auth');
  };

  return (
    <header className="bg-white shadow-sm h-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex items-center justify-between h-full">
          <div className="flex items-center">
            <Link href="/dashboard" className="flex items-center">
              <span className="text-2xl font-bold text-blue-600">Resume AI</span>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={handleSignOut}
              className="text-gray-500 hover:text-gray-700 text-sm font-medium"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}