import { Suspense } from 'react';
import { createClient } from '@/lib/supabase/server';
import JobDescriptionManager from '@/components/jobs/job-description-manager';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

export default async function JobsPage() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6 backdrop-blur-sm">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-yellow-500/20 rounded-lg">
                <ExclamationTriangleIcon className="h-6 w-6 text-yellow-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">Authentication Required</h3>
            </div>
            <p className="text-yellow-200">
              Please sign in to manage job descriptions and access your personalized resume tailoring features.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Suspense 
          fallback={
            <div className="space-y-6">
              {/* Header Skeleton */}
              <div className="animate-pulse">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <div className="h-8 bg-slate-700/50 rounded w-64 mb-2"></div>
                    <div className="h-4 bg-slate-700/50 rounded w-96"></div>
                  </div>
                  <div className="h-10 bg-slate-700/50 rounded w-40"></div>
                </div>
              </div>
              
              {/* Stats Skeleton */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-pulse">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="h-20 bg-slate-800/50 rounded-xl border border-slate-700/50"></div>
                ))}
              </div>
              
              {/* Content Skeleton */}
              <div className="space-y-4 animate-pulse">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="h-32 bg-slate-800/50 rounded-xl border border-slate-700/50"></div>
                ))}
              </div>
            </div>
          }
        >
          <JobDescriptionManager />
        </Suspense>
      </div>
    </div>
  );
}