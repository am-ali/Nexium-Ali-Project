import React from 'react';
import { Suspense } from 'react';
import UploadForm from '@/components/resume/upload-form';
import Preview from '@/components/resume/preview';
import { processUpload } from '@/lib/actions';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/auth');
  }

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <div className="mt-6">
          <div className="bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-lg font-medium text-gray-900">Welcome back!</h2>
              <p className="mt-1 text-sm text-gray-600">
                Get started with AI-powered resume tailoring for your job applications.
              </p>
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <a
                  href="/dashboard/upload"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  Upload Resume
                </a>
                <a
                  href="/dashboard/jobs"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Add Job Description
                </a>
                <a
                  href="/dashboard/tailor"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                >
                  Tailor Resume
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}