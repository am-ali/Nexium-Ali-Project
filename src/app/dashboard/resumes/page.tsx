import { Suspense } from 'react';
import { createClient } from '@/lib/supabase/server';
import ResumeManager from '@/components/resume/resume-manager';

export default async function ResumesPage() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return (
      <div className="max-w-4xl mx-auto py-8">
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <p className="text-yellow-700">
            Please sign in to manage your resumes.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">My Resumes</h1>
      </div>
      
      <Suspense 
        fallback={
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg" />
            ))}
          </div>
        }
      >
        <ResumeManager />
      </Suspense>
    </div>
  );
}