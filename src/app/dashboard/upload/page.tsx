'use client';

import React, { Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import UploadForm from '@/components/resume/upload-form';

export default function UploadPage() {
  const router = useRouter();

  const handleUploadSuccess = (): void => {
    // Redirect to dashboard after successful upload
    router.push('/dashboard');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Upload Resume
          </h1>
          <p className="text-gray-600">
            Upload your resume file or paste the text content to get started with AI-powered tailoring.
          </p>
        </div>

        <Suspense 
          fallback={
            <div className="animate-pulse space-y-4">
              <div className="h-64 bg-gray-200 rounded-lg"/>
            </div>
          }
        >
          <UploadForm 
            onUploadSuccess={handleUploadSuccess} 
          />
        </Suspense>

        <div className="mt-8 p-6 bg-blue-50 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            Tips for best results:
          </h3>
          <ul className="list-disc list-inside space-y-1 text-sm text-blue-800">
            <li>Use a well-formatted resume with clear sections</li>
            <li>Include relevant skills, experience, and education</li>
            <li>Supported formats: PDF, DOCX, and plain text</li>
            <li>File size limit: 10MB maximum</li>
          </ul>
        </div>
      </div>
    </div>
  );
}