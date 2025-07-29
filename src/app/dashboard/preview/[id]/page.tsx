import React from 'react';
import { notFound } from 'next/navigation';
import { connect } from '@/lib/mongodb';
import Preview from '@/components/resume/preview';

interface Props {
  params: {
    id: string;
  };
}

export default async function ResumePreviewPage({ params }: Props) {
  const db = await connect();
  const resume = await db
    .collection('resumes')
    .findOne({ id: params.id });

  if (!resume) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Resume Preview</h1>
      <Preview tailoredResume={resume.content} />
    </div>
  );
}