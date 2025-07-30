'use client';

import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface UploadFormProps {
  onUploadSuccess?: () => void;
}

const UploadForm: React.FC<UploadFormProps> = ({ onUploadSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadMethod, setUploadMethod] = useState<'file' | 'text'>('file');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validate file type
      const allowedTypes = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain'
      ];
      
      if (!allowedTypes.includes(selectedFile.type)) {
        toast.error('Please upload a PDF, DOCX, or plain text file');
        e.target.value = '';
        return;
      }

      // Validate file size (10MB limit)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (selectedFile.size > maxSize) {
        toast.error('File size must be less than 10MB');
        e.target.value = '';
        return;
      }

      setFile(selectedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    
    if (uploadMethod === 'file' && !file) {
      toast.error('Please select a file');
      return;
    }
    
    if (uploadMethod === 'text' && !text.trim()) {
      toast.error('Please enter your resume text');
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      
      if (uploadMethod === 'file' && file) {
        formData.append('file', file);
      } else if (uploadMethod === 'text') {
        formData.append('text', text);
      }

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Upload failed');
      }

      toast.success('Resume uploaded successfully!');
      
      // Reset form
      setFile(null);
      setText('');
      const fileInput = document.getElementById('file-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      
      // Call success callback
      onUploadSuccess?.();
      
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">Upload Your Resume</h2>
      
      {/* Upload Method Selection */}
      <div className="mb-6">
        <div className="flex space-x-4">
          <Button
            type="button"
            variant={uploadMethod === 'file' ? 'primary' : 'outline'}
            onClick={() => setUploadMethod('file')}
          >
            Upload File
          </Button>
          <Button
            type="button"
            variant={uploadMethod === 'text' ? 'primary' : 'outline'}
            onClick={() => setUploadMethod('text')}
          >
            Paste Text
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {uploadMethod === 'file' ? (
          <div>
            <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700 mb-2">
              Choose Resume File
            </label>
            <input
              id="file-upload"
              type="file"
              accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
              onChange={handleFileChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={uploading}
            />
            <p className="text-xs text-gray-500 mt-1">
              Supported formats: PDF, DOCX, TXT (Max 10MB)
            </p>
            {file && (
              <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
                <p className="text-sm text-green-700">
                  Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              </div>
            )}
          </div>
        ) : (
          <div>
            <label htmlFor="resume-text" className="block text-sm font-medium text-gray-700 mb-2">
              Paste Your Resume Text
            </label>
            <textarea
              id="resume-text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={12}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={uploading}
              placeholder="Copy and paste your resume content here..."
            />
            <p className="text-xs text-gray-500 mt-1">
              Paste the text content of your resume
            </p>
          </div>
        )}

        <Button
          type="submit"
          disabled={uploading || (uploadMethod === 'file' && !file) || (uploadMethod === 'text' && !text.trim())}
          className="w-full"
        >
          {uploading ? 'Uploading...' : 'Upload Resume'}
        </Button>
      </form>
    </Card>
  );
};

export default UploadForm;