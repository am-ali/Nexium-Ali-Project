import React from 'react';
import UploadForm from '@/components/resume/upload-form';
import Preview from '@/components/resume/preview';

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Upload Resume</h2>
          <UploadForm onSubmit={async (data) => {
            // Handle form submission
            console.log('Form submitted:', data);
          }} />
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Preview</h2>
          <Preview tailoredResume="Your tailored resume will appear here" />
        </div>
      </div>
    </div>
  );
}