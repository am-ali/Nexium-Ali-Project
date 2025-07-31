'use client';

import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  DocumentTextIcon, 
  CloudArrowUpIcon, 
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

interface UploadFormProps {
  onUploadSuccess?: () => void;
}

const UploadForm: React.FC<UploadFormProps> = ({ onUploadSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadMethod, setUploadMethod] = useState<'file' | 'text'>('file');
  const [dragActive, setDragActive] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      validateAndSetFile(selectedFile);
    }
  };

  const validateAndSetFile = (selectedFile: File): void => {
    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];
    
    if (!allowedTypes.includes(selectedFile.type)) {
      toast.error('Please upload a PDF, DOCX, or plain text file');
      return;
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (selectedFile.size > maxSize) {
      toast.error('File size must be less than 10MB');
      return;
    }

    setFile(selectedFile);
  };

  const handleDrag = (e: React.DragEvent): void => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent): void => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
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

  const getFileIcon = (fileName: string): React.ReactNode => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf':
        return <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center">
          <span className="text-red-400 font-bold text-xs">PDF</span>
        </div>;
      case 'docx':
      case 'doc':
        return <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
          <span className="text-blue-400 font-bold text-xs">DOC</span>
        </div>;
      case 'txt':
        return <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
          <span className="text-green-400 font-bold text-xs">TXT</span>
        </div>;
      default:
        return <DocumentTextIcon className="w-8 h-8 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-8 bg-slate-800/50 border-slate-700/50">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-purple-500/20 rounded-lg">
            <CloudArrowUpIcon className="h-6 w-6 text-purple-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Upload Your Resume</h2>
            <p className="text-slate-400">Choose how you'd like to upload your resume</p>
          </div>
        </div>
        
        {/* Upload Method Selection */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              type="button"
              variant={uploadMethod === 'file' ? 'primary' : 'outline'}
              onClick={() => setUploadMethod('file')}
              className={
                (uploadMethod === 'file' 
                  ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white' 
                  : 'border-slate-600/50 text-slate-300 hover:bg-slate-700/50'
                ) + ' flex items-center justify-center'
              }
            >
              <span className="flex items-center justify-center w-full">
                <DocumentTextIcon className="h-4 w-4 mr-2" />
                Upload File
              </span>
            </Button>
            <Button
              type="button"
              variant={uploadMethod === 'text' ? 'primary' : 'outline'}
              onClick={() => setUploadMethod('text')}
              className={
              (uploadMethod === 'text' 
                ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white' 
                : 'border-slate-600/50 text-slate-300 hover:bg-slate-700/50'
              ) + ' flex items-center justify-center'
              }
            >
              <span className="flex items-center justify-center w-full">
              <DocumentTextIcon className="h-4 w-4 mr-2" />
              Paste Text
              </span>
            </Button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {uploadMethod === 'file' ? (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-3">
                Choose Resume File
              </label>
              
              {/* Custom File Upload Area */}
              <div
                className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
                  dragActive || file
                    ? 'border-purple-500/50 bg-purple-500/10'
                    : 'border-slate-600/50 hover:border-slate-500/50 hover:bg-slate-700/20'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  id="file-upload"
                  type="file"
                  accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={uploading}
                />
                
                {file ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-center space-x-3">
                      {getFileIcon(file.name)}
                      <div className="text-left">
                        <p className="text-sm font-medium text-white truncate max-w-xs">
                          {file.name}
                        </p>
                        <p className="text-xs text-slate-400">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setFile(null);
                          const fileInput = document.getElementById('file-upload') as HTMLInputElement;
                          if (fileInput) fileInput.value = '';
                        }}
                        className="p-1 hover:bg-slate-700/50 rounded-full transition-colors"
                      >
                        <XMarkIcon className="h-4 w-4 text-slate-400 hover:text-slate-300" />
                      </button>
                    </div>
                    <div className="flex items-center justify-center space-x-2 text-green-400">
                      <CheckCircleIcon className="h-5 w-5" />
                      <span className="text-sm font-medium">File ready for upload</span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <CloudArrowUpIcon className="h-12 w-12 text-slate-500 mx-auto" />
                    <div>
                      <p className="text-lg font-medium text-white mb-1">
                        Drop your resume here, or click to browse
                      </p>
                      <p className="text-sm text-slate-400">
                        Supports PDF, DOCX, and TXT files up to 10MB
                      </p>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="mt-3 flex items-start space-x-2 text-xs text-slate-500">
                <InformationCircleIcon className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>Supported formats: PDF, DOCX, TXT (Maximum 10MB)</span>
              </div>
            </div>
          ) : (
            <div>
              <label htmlFor="resume-text" className="block text-sm font-medium text-slate-300 mb-3">
                Paste Your Resume Text
              </label>
              <div className="relative">
                <textarea
                  id="resume-text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  rows={12}
                  className="w-full p-4 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-vertical"
                  disabled={uploading}
                  placeholder="Copy and paste your resume content here...

Include all sections like:
• Contact information
• Professional summary
• Work experience
• Education
• Skills
• Achievements"
                />
                <div className="absolute bottom-3 right-3 text-xs text-slate-500">
                  {text.length} characters
                </div>
              </div>
              <div className="mt-3 flex items-start space-x-2 text-xs text-slate-500">
                <InformationCircleIcon className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>Paste the complete text content of your resume for best results</span>
              </div>
            </div>
          )}

          <Button
            type="submit"
            disabled={uploading || (uploadMethod === 'file' && !file) || (uploadMethod === 'text' && !text.trim())}
            className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            size="lg"
          >
            {uploading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                <span>Uploading...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <CloudArrowUpIcon className="h-5 w-5" />
                <span>Upload Resume</span>
              </div>
            )}
          </Button>
        </form>
      </Card>

      {/* Tips Section */}
      <Card className="p-6 bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/20">
        <div className="flex items-start space-x-3">
          <div className="p-2 bg-blue-500/20 rounded-lg flex-shrink-0">
            <InformationCircleIcon className="h-5 w-5 text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">
              💡 Tips for Best Results
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-3">
                <div className="flex items-start space-x-2">
                  <CheckCircleIcon className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                  <span className="text-slate-300">Use clear, professional formatting</span>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircleIcon className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                  <span className="text-slate-300">Include quantified achievements</span>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircleIcon className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                  <span className="text-slate-300">List relevant skills and technologies</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-start space-x-2">
                  <ExclamationTriangleIcon className="h-4 w-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                  <span className="text-slate-300">Avoid images or complex layouts</span>
                </div>
                <div className="flex items-start space-x-2">
                  <ExclamationTriangleIcon className="h-4 w-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                  <span className="text-slate-300">Keep file size under 10MB</span>
                </div>
                <div className="flex items-start space-x-2">
                  <ExclamationTriangleIcon className="h-4 w-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                  <span className="text-slate-300">Use standard fonts and formatting</span>
                </div>
              </div>
            </div>
            <div className="mt-4 p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
              <p className="text-xs text-slate-400">
                <strong className="text-slate-300">Pro Tip:</strong> Our AI works best with resumes that have clear section headers 
                (Experience, Education, Skills, etc.) and bullet points for achievements.
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default UploadForm;