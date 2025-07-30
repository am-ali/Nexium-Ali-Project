import React from 'react';
import { notFound } from 'next/navigation';
import { connect } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import Preview from '@/components/resume/preview';

interface Props {
  params: {
    id: string;
  };
}

export default async function ResumePreviewPage({ params }: Props) {
  const { id } = await params;
  const db = await connect();
  
  // First try to find a tailored resume
  let resume = await db
    .collection('tailored_resumes')
    .findOne({ _id: new ObjectId(id) });

  if (resume) {
    return (
      <div className="max-w-4xl mx-auto py-8">
        <h1 className="text-2xl font-bold mb-6">Tailored Resume Preview</h1>
        <div className="mb-4 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Match Score:</strong> {resume.matchScore}%
          </p>
          {resume.suggestedChanges && resume.suggestedChanges.length > 0 && (
            <div className="mt-2">
              <p className="text-sm font-medium text-blue-800">Changes Made:</p>
              <ul className="text-sm text-blue-700 mt-1">
                {resume.suggestedChanges.map((change: any, index: number) => (
                  <li key={index}>• {change.description}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <Preview tailoredResume={resume.tailoredContent} />
      </div>
    );
  }

  // If not found in tailored resumes, try regular resumes
  resume = await db
    .collection('resumes')
    .findOne({ _id: new ObjectId(id) });

  if (!resume) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Resume Preview</h1>
      <Preview tailoredResume={resume.originalContent || resume.content} />
    </div>
  );
}