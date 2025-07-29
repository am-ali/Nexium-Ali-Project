'use client';

import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { TailoredResume } from '@/types';
import { Button } from '@/components/ui/button';

export const ResumeHistory: React.FC = () => {
  const [resumes, setResumes] = React.useState<TailoredResume[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
    try {
      const response = await fetch('/api/resumes/history');
      if (!response.ok) throw new Error('Failed to fetch resumes');
      const data = await response.json();
      setResumes(data);
    } catch (error) {
      console.error('Error fetching resumes:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {resumes.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No resume history found. Start by uploading a resume!
        </div>
      ) : (
        resumes.map((resume) => (
          <div
            key={resume.id}
            className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {resume.originalResumeId}
                </h3>
                <p className="text-sm text-gray-500">
                  Created {formatDistanceToNow(new Date(resume.createdAt))} ago
                </p>
                <div className="mt-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Match Score: {resume.matchScore}%
                  </span>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => window.open(`/api/resumes/${resume.id}/download`)}
                >
                  Download
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => window.location.href = `/dashboard/preview/${resume.id}`}
                >
                  Preview
                </Button>
              </div>
            </div>
            {resume.suggestedChanges.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-900">Changes Made:</h4>
                <ul className="mt-2 space-y-2">
                  {resume.suggestedChanges.map((change, index) => (
                    <li key={index} className="text-sm text-gray-600">
                      • {change.type}: {change.description}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
};