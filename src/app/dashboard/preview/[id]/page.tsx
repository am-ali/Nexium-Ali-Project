import { Suspense } from 'react';
import { connect } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Preview from '@/components/resume/preview';
import { Card } from '@/components/ui/card';

interface PageProps {
  params: Promise<{ id: string }>;
}

async function getTailoredResume(id: string, userId: string) {
  try {
    const db = await connect();
    const tailoredResume = await db.collection('tailored_resumes').findOne({
      _id: new ObjectId(id),
      userId: userId
    });
    
    if (!tailoredResume) {
      return null;
    }
    
    return {
      id: tailoredResume._id.toString(),
      title: tailoredResume.title,
      tailoredContent: tailoredResume.tailoredContent,
      originalContent: tailoredResume.originalContent,
      matchScore: tailoredResume.matchScore,
      suggestedChanges: tailoredResume.suggestedChanges,
      jobTitle: tailoredResume.jobTitle,
      company: tailoredResume.company,
      createdAt: tailoredResume.createdAt
    };
  } catch (error) {
    console.error('Error fetching tailored resume:', error);
    return null;
  }
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="animate-pulse">
        <div className="h-8 bg-slate-700/50 rounded w-1/3 mb-4"></div>
        <div className="h-96 bg-slate-800/50 rounded-xl"></div>
      </div>
    </div>
  );
}

export default async function PreviewPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth');
  }

  const tailoredResume = await getTailoredResume(id, user.id);

  if (!tailoredResume) {
    return (
      <div className="max-w-4xl mx-auto py-8">
        <Card className="p-8 text-center bg-slate-800/50 border-slate-700/50">
          <h1 className="text-2xl font-bold text-white mb-4">Resume Not Found</h1>
          <p className="text-slate-400 mb-6">
            The tailored resume you're looking for doesn't exist or you don't have permission to view it.
          </p>
          <a
            href="/dashboard"
            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all"
          >
            Return to Dashboard
          </a>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <Suspense fallback={<LoadingSkeleton />}>
        <Preview
          tailoredResume={tailoredResume.tailoredContent}
          originalResume={tailoredResume.originalContent}
          matchScore={tailoredResume.matchScore}
          suggestedChanges={tailoredResume.suggestedChanges}
          jobTitle={tailoredResume.jobTitle}
        />
      </Suspense>
    </div>
  );
}