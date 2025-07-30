'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Resume } from '@/types';
import {
  DocumentTextIcon,
  TrashIcon,
  PencilIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  CalendarIcon,
  DocumentDuplicateIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

interface ResumeManagerProps {}

const ResumeManager: React.FC<ResumeManagerProps> = () => {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedResumes, setSelectedResumes] = useState<string[]>([]);

  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async (): Promise<void> => {
    try {
      setLoading(true);
      const response = await fetch('/api/resumes/history');
      if (!response.ok) throw new Error('Failed to fetch resumes');
      const data = await response.json();
      setResumes(data);
    } catch (error) {
      console.error('Error fetching resumes:', error);
      toast.error('Failed to load resumes');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (resumeId: string): Promise<void> => {
    if (!confirm('Are you sure you want to delete this resume? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/resumes/${resumeId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete resume');
      }

      toast.success('Resume deleted successfully');
      fetchResumes(); // Refresh the list
    } catch (error) {
      console.error('Error deleting resume:', error);
      toast.error('Failed to delete resume');
    }
  };

  const handleBulkDelete = async (): Promise<void> => {
    if (selectedResumes.length === 0) return;
    
    if (!confirm(`Are you sure you want to delete ${selectedResumes.length} resume(s)? This action cannot be undone.`)) {
      return;
    }

    try {
      await Promise.all(
        selectedResumes.map(id => 
          fetch(`/api/resumes/${id}`, { method: 'DELETE' })
        )
      );
      
      toast.success(`${selectedResumes.length} resume(s) deleted successfully`);
      setSelectedResumes([]);
      fetchResumes();
    } catch (error) {
      console.error('Error deleting resumes:', error);
      toast.error('Failed to delete some resumes');
    }
  };

  const handleSelectResume = (resumeId: string): void => {
    setSelectedResumes(prev => 
      prev.includes(resumeId) 
        ? prev.filter(id => id !== resumeId)
        : [...prev, resumeId]
    );
  };

  const handleSelectAll = (): void => {
    if (selectedResumes.length === resumes.length) {
      setSelectedResumes([]);
    } else {
      setSelectedResumes(resumes.map(resume => resume._id || resume.id || ''));
    }
  };

  const getResumeId = (resume: Resume): string => {
    return resume._id || resume.id || '';
  };

  const LoadingSkeleton = () => (
    <div className="space-y-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <Card key={index} className="p-6">
          <div className="animate-pulse">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );

  if (loading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center space-x-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {resumes.length} Resume{resumes.length !== 1 ? 's' : ''}
          </h2>
          {selectedResumes.length > 0 && (
            <span className="text-sm text-gray-600">
              {selectedResumes.length} selected
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {selectedResumes.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleBulkDelete}
              className="text-red-600 hover:text-red-700"
            >
              <TrashIcon className="h-4 w-4 mr-1" />
              Delete Selected
            </Button>
          )}
          
          <Link href="/dashboard/upload">
            <Button size="sm">
              <DocumentTextIcon className="h-4 w-4 mr-1" />
              Upload New Resume
            </Button>
          </Link>
        </div>
      </div>

      {/* Bulk Actions */}
      {resumes.length > 0 && (
        <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={selectedResumes.length === resumes.length}
              onChange={handleSelectAll}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Select all</span>
          </label>
          
          {selectedResumes.length > 0 && (
            <span className="text-sm text-gray-600">
              {selectedResumes.length} of {resumes.length} selected
            </span>
          )}
        </div>
      )}

      {/* Resume List */}
      {resumes.length === 0 ? (
        <Card className="p-12 text-center">
          <DocumentTextIcon className="h-16 w-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No resumes yet</h3>
          <p className="text-gray-600 mb-6">
            Upload your first resume to get started with AI-powered tailoring.
          </p>
          <Link href="/dashboard/upload">
            <Button>
              <DocumentTextIcon className="h-4 w-4 mr-2" />
              Upload Resume
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-4">
          {resumes.map((resume) => {
            const resumeId = getResumeId(resume);
            const isSelected = selectedResumes.includes(resumeId);
            
            return (
              <Card key={resumeId} className={`p-6 transition-all ${isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:shadow-md'}`}>
                <div className="flex items-center space-x-4">
                  <label className="cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleSelectResume(resumeId)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </label>
                  
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <DocumentTextIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-medium text-gray-900 truncate">
                      {resume.title || 'Untitled Resume'}
                    </h3>
                    <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                      <span className="flex items-center">
                        <CalendarIcon className="h-4 w-4 mr-1" />
                        {resume.createdAt ? formatDistanceToNow(new Date(resume.createdAt), { addSuffix: true }) : 'Unknown date'}
                      </span>
                      {resume.fileName && (
                        <span className="flex items-center">
                          <DocumentDuplicateIcon className="h-4 w-4 mr-1" />
                          {resume.fileName}
                        </span>
                      )}
                      <span className="px-2 py-1 bg-gray-100 rounded-md text-xs">
                        {resume.status || 'Active'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Link href={`/dashboard/preview/${resumeId}`}>
                      <Button variant="outline" size="sm">
                        <EyeIcon className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </Link>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // Download functionality
                        const element = document.createElement('a');
                        const file = new Blob([resume.content || resume.originalContent || ''], { type: 'text/plain' });
                        element.href = URL.createObjectURL(file);
                        element.download = `${resume.title || 'resume'}.txt`;
                        document.body.appendChild(element);
                        element.click();
                        document.body.removeChild(element);
                      }}
                    >
                      <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                    
                    <Link href={`/dashboard/tailor?resumeId=${resumeId}`}>
                      <Button variant="outline" size="sm" className="text-purple-600 hover:text-purple-700">
                        <PencilIcon className="h-4 w-4 mr-1" />
                        Tailor
                      </Button>
                    </Link>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(resumeId)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ResumeManager;