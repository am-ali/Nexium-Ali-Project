import React from 'react';
import { connect } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { notFound } from 'next/navigation';

interface PageProps {
  params: Promise<{ id: string }>;
}

interface SuggestedChange {
  type: 'addition' | 'removal' | 'modification';
  section: string;
  description: string;
}

export default async function PreviewPage({ params }: PageProps) {
  const { id } = await params;
  
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth');
  }

  try {
    const db = await connect();
    
    // First try to find in tailored_resumes collection
    let resumeDoc = await db.collection('tailored_resumes').findOne({
      _id: new ObjectId(id),
      userId: user.id
    });

    // If not found, try the regular resumes collection
    if (!resumeDoc) {
      resumeDoc = await db.collection('resumes').findOne({
        _id: new ObjectId(id),
        userId: user.id
      });
    }

    if (!resumeDoc) {
      notFound();
    }

    const resume = {
      id: resumeDoc._id.toString(),
      title: resumeDoc.title || 'Untitled Resume',
      content: resumeDoc.tailoredContent || resumeDoc.content || resumeDoc.originalContent,
      matchScore: resumeDoc.matchScore,
      suggestedChanges: (resumeDoc.suggestedChanges || []) as SuggestedChange[],
      createdAt: resumeDoc.createdAt,
      updatedAt: resumeDoc.updatedAt
    };

    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {resume.title}
            </h1>
            {resume.matchScore && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Match Score:</span>
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-sm font-medium">
                  {resume.matchScore}%
                </span>
              </div>
            )}
          </div>

          <div className="bg-white shadow-lg rounded-lg">
            <div className="p-6">
              <div 
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ __html: resume.content }}
              />
            </div>
          </div>

          {resume.suggestedChanges && resume.suggestedChanges.length > 0 && (
            <div className="mt-8 bg-white shadow-lg rounded-lg">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Suggested Changes
                </h2>
                <div className="space-y-4">
                  {resume.suggestedChanges.map((change: SuggestedChange, index: number) => (
                    <div key={index} className="border-l-4 border-blue-500 pl-4">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className={`px-2 py-1 text-xs rounded-md font-medium ${
                          change.type === 'addition' ? 'bg-green-100 text-green-800' :
                          change.type === 'removal' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {change.type}
                        </span>
                        <span className="text-sm font-medium text-gray-700">
                          {change.section}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {change.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error fetching resume:', error);
    notFound();
  }
}