'use client';

import React, { Suspense } from 'react';
import { useRouter } from 'next/navigation';
import UploadForm from '@/components/resume/upload-form';
import { CloudArrowUpIcon, DocumentTextIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { Card } from '@/components/ui/card';

export default function UploadPage() {
  const router = useRouter();

  const handleUploadSuccess = (): void => {
    // Redirect to dashboard after successful upload
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <div className="p-3 bg-purple-500/20 rounded-xl border border-purple-500/30">
              <CloudArrowUpIcon className="h-8 w-8 text-purple-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Upload Resume
              </h1>
              <p className="text-slate-400">
                Upload your resume file or paste the text content to get started with AI-powered tailoring.
              </p>
            </div>
          </div>
        </div>

        {/* Upload Form */}
        <Suspense 
          fallback={
            <div className="space-y-6">
              {/* Header Skeleton */}
              <Card className="p-8 bg-slate-800/50 border-slate-700/50">
                <div className="animate-pulse">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-12 h-12 bg-slate-700/50 rounded-lg"></div>
                    <div className="flex-1">
                      <div className="h-6 bg-slate-700/50 rounded w-48 mb-2"></div>
                      <div className="h-4 bg-slate-700/50 rounded w-80"></div>
                    </div>
                  </div>
                  
                  {/* Upload Area Skeleton */}
                  <div className="h-48 bg-slate-700/50 rounded-xl mb-6"></div>
                  
                  {/* Button Skeleton */}
                  <div className="h-12 bg-slate-700/50 rounded-lg"></div>
                </div>
              </Card>
              
              {/* Tips Skeleton */}
              <Card className="p-6 bg-slate-800/50 border-slate-700/50">
                <div className="animate-pulse">
                  <div className="h-6 bg-slate-700/50 rounded w-40 mb-4"></div>
                  <div className="space-y-2">
                    {Array.from({ length: 4 }).map((_, index) => (
                      <div key={index} className="h-4 bg-slate-700/50 rounded w-full"></div>
                    ))}
                  </div>
                </div>
              </Card>
            </div>
          }
        >
          <UploadForm 
            onUploadSuccess={handleUploadSuccess} 
          />
        </Suspense>

        {/* Additional Tips */}
        <Card className="mt-8 p-6 bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/20">
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-blue-500/20 rounded-lg flex-shrink-0">
              <DocumentTextIcon className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">
                📋 Upload Guidelines
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-3">
                  <div className="flex items-start space-x-2">
                    <CheckCircleIcon className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-slate-300">Use well-formatted resume with clear sections</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <CheckCircleIcon className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-slate-300">Include relevant skills, experience, and education</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start space-x-2">
                    <CheckCircleIcon className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-slate-300">Supported formats: PDF, DOCX, and plain text</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <CheckCircleIcon className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-slate-300">File size limit: 10MB maximum</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
                <p className="text-xs text-slate-400">
                  <strong className="text-slate-300">Note:</strong> Your resume data is processed securely and used only for tailoring purposes. 
                  We never share your personal information with third parties.
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Quick Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4 bg-slate-800/50 border-slate-700/50 text-center">
            <div className="text-2xl font-bold text-purple-400 mb-1">AI-Powered</div>
            <div className="text-sm text-slate-400">Smart resume analysis</div>
          </Card>
          
          <Card className="p-4 bg-slate-800/50 border-slate-700/50 text-center">
            <div className="text-2xl font-bold text-blue-400 mb-1">Instant</div>
            <div className="text-sm text-slate-400">Quick processing</div>
          </Card>
          
          <Card className="p-4 bg-slate-800/50 border-slate-700/50 text-center">
            <div className="text-2xl font-bold text-green-400 mb-1">Secure</div>
            <div className="text-sm text-slate-400">Your data protected</div>
          </Card>
        </div>
      </div>
    </div>
  );
}