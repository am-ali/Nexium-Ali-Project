'use client';

import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import type { Resume as ResumeType } from '@/types';
import { Button } from '@/components/ui/button';

interface ResumeItem {
  _id?: string;
  id?: string;
  type: 'original' | 'tailored';
  title?: string;
  fileName?: string;
  content?: string;
  originalContent?: string;
  tailoredContent?: string;
  matchScore?: number;
  suggestedChanges?: any[];
  createdAt?: Date;
  uploadDate?: Date;
  originalResumeId?: string;
  jobDescriptionId?: string;
}

interface HistoryProps {
  resumes: ResumeType[];
  onSelect: (resume: ResumeType) => void;
}

export const ResumeHistory: React.FC = () => {
  const [resumes, setResumes] = React.useState<ResumeItem[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
    try {
      // Fetch both regular resumes and tailored resumes
      const [resumesResponse, tailoredResponse] = await Promise.all([
        fetch('/api/resumes/history'),
        fetch('/api/resumes/tailored')
      ]);

      const regularResumes = resumesResponse.ok ? await resumesResponse.json() : [];
      const tailoredResumes = tailoredResponse.ok ? await tailoredResponse.json() : [];

      // Combine and format the data
      const allResumes: ResumeItem[] = [
        ...regularResumes.map((resume: any) => ({
          ...resume,
          type: 'original' as const
        })),
        ...tailoredResumes.map((resume: any) => ({
          ...resume,
          type: 'tailored' as const
        }))
      ];

      // Sort by date (newest first)
      allResumes.sort((a, b) => {
        const dateA = new Date(a.createdAt || a.uploadDate || 0);
        const dateB = new Date(b.createdAt || b.uploadDate || 0);
        return dateB.getTime() - dateA.getTime();
      });

      setResumes(allResumes);
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
            key={resume._id || resume.id}
            className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {resume.type === 'tailored' ? 'Tailored Resume' : (resume.title || 'Untitled Resume')}
                </h3>
                <p className="text-sm text-gray-500">
                  {resume.type === 'tailored' ? 'AI Tailored' : (resume.fileName || 'Text input')}
                </p>
                <p className="text-sm text-gray-500">
                  Created {formatDistanceToNow(new Date(resume.createdAt || resume.uploadDate || Date.now()))} ago
                </p>
                {resume.matchScore && (
                  <div className="mt-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Match Score: {resume.matchScore}%
                    </span>
                  </div>
                )}
              </div>
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => window.location.href = `/dashboard/preview/${resume._id || resume.id}`}
                >
                  Preview
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => window.open(`/api/resumes/${resume._id || resume.id}/download`)}
                >
                  Download
                </Button>
                {resume.type === 'tailored' && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.location.href = `/dashboard/tailor?jobId=${resume.jobDescriptionId}`}
                  >
                    Re-tailor
                  </Button>
                )}
              </div>
            </div>
            {resume.suggestedChanges && resume.suggestedChanges.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-900">Changes Made:</h4>
                <ul className="mt-2 space-y-2">
                  {resume.suggestedChanges.map((change, index) => (
                    <li key={index} className="text-sm text-gray-600">
                      • {change.description || `${change.type}: ${change.section}`}
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