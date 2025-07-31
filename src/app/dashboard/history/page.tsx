import React from 'react';
import { Suspense } from 'react';
import { ResumeHistory } from '@/components/resume/history';

export default async function HistoryPage() {
  return (
    <div className="space-y-8">

      <Suspense fallback={<div className="animate-pulse space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-32 bg-gray-200 rounded-lg" />
        ))}
      </div>}>
        <ResumeHistory />
      </Suspense>
    </div>
  );
}