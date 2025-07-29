'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { processUpload } from '@/lib/actions';

interface ResumeEditorProps {
  initialContent?: string;
  onSave?: (content: string) => void;
}

const ResumeEditor: React.FC<ResumeEditorProps> = ({ initialContent = '', onSave }) => {
  const [resumeContent, setResumeContent] = useState<string>(initialContent);
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setResumeContent(event.target.value);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await processUpload({ text: resumeContent });
      onSave?.(resumeContent);
    } catch (error) {
      console.error('Failed to save resume:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Edit Your Resume</h2>
      <textarea
        value={resumeContent}
        onChange={handleChange}
        placeholder="Paste or write your resume here..."
        className="w-full p-4 min-h-[300px] border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
      <Button 
        onClick={handleSave} 
        isLoading={isSaving}
        className="w-full"
      >
        {isSaving ? 'Saving...' : 'Save Resume'}
      </Button>
    </div>
  );
};

export default ResumeEditor;