import { Suspense } from 'react';
import { createClient } from '@/lib/supabase/server';
import JobDescriptionManager from '@/components/jobs/job-description-manager';

export default async function JobsPage() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return (
      <div className="max-w-4xl mx-auto py-8">
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <p className="text-yellow-700">
            Please sign in to manage job descriptions.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Job Descriptions</h1>
      <Suspense 
        fallback={
          <div className="animate-pulse space-y-4">
            <div className="h-64 bg-gray-200 rounded-lg"/>
          </div>
        }
      >
        <JobDescriptionManager />
      </Suspense>
    </div>
  );
} 