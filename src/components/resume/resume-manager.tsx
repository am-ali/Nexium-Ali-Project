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
        <Card key={index} className="p-6 bg-slate-800/50 border-slate-700/50">
          <div className="animate-pulse">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-slate-700/50 rounded-lg"></div>
              <div className="flex-1">
                <div className="h-4 bg-slate-700/50 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-slate-700/50 rounded w-1/2"></div>
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
          <h2 className="text-lg font-semibold text-white">
            {resumes.length} Resume{resumes.length !== 1 ? 's' : ''}
          </h2>
          {selectedResumes.length > 0 && (
            <span className="text-sm text-slate-400">
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
              className="border-red-500/50 text-red-400 hover:bg-red-500/10 hover:text-red-300"
            >
              <TrashIcon className="h-4 w-4 mr-1" />
              Delete Selected
            </Button>
          )}
          
          <Link href="/dashboard/upload">
            <Button 
              size="sm"
              className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
            >
              <DocumentTextIcon className="h-4 w-4 mr-1" />
              Upload New Resume
            </Button>
          </Link>
        </div>
      </div>

      {/* Bulk Actions */}
      {resumes.length > 0 && (
        <div className="flex items-center space-x-4 p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={selectedResumes.length === resumes.length}
              onChange={handleSelectAll}
              className="rounded border-slate-600 bg-slate-700 text-purple-500 focus:ring-purple-500 focus:ring-offset-slate-800"
            />
            <span className="text-sm text-slate-300">Select all</span>
          </label>
          
          {selectedResumes.length > 0 && (
            <span className="text-sm text-slate-400">
              {selectedResumes.length} of {resumes.length} selected
            </span>
          )}
        </div>
      )}

      {/* Resume List */}
      {resumes.length === 0 ? (
        <Card className="p-12 text-center bg-slate-800/50 border-slate-700/50">
          <DocumentTextIcon className="h-16 w-16 mx-auto mb-4 text-slate-600" />
          <h3 className="text-lg font-medium text-white mb-2">No resumes yet</h3>
          <p className="text-slate-400 mb-6">
            Upload your first resume to get started with AI-powered tailoring.
          </p>
          <Link href="/dashboard/upload">
            <Button className="bg-gradient-to-r from-purple-500 to-blue-500">
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
              <Card 
                key={resumeId} 
                className={`p-6 transition-all bg-slate-800/50 border-slate-700/50 hover:bg-slate-800/70 ${
                  isSelected ? 'ring-2 ring-purple-500 bg-purple-500/10' : ''
                }`}
              >
                <div className="flex items-center space-x-4">
                  <label className="cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleSelectResume(resumeId)}
                      className="rounded border-slate-600 bg-slate-700 text-purple-500 focus:ring-purple-500 focus:ring-offset-slate-800"
                    />
                  </label>
                  
                  <div className="p-3 bg-blue-500/20 rounded-lg border border-blue-500/30">
                    <DocumentTextIcon className="h-6 w-6 text-blue-400" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-medium text-white truncate">
                      {resume.title || 'Untitled Resume'}
                    </h3>
                    <div className="flex items-center space-x-4 mt-1 text-sm text-slate-400">
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
                      <span className="px-2 py-1 bg-slate-700/50 rounded-md text-xs text-slate-300">
                        {resume.status || 'Active'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Link href={`/dashboard/preview/${resumeId}`}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-slate-600/50 text-slate-300 hover:bg-slate-700/50 hover:text-white flex items-center gap-1"
                      >
                        <EyeIcon className="h-4 w-4" style={{ verticalAlign: 'middle' }} />
                        <span className="inline-flex items-center h-4">View</span>
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
                      className="border-slate-600/50 text-slate-300 hover:bg-slate-700/50 hover:text-white flex items-center"
                    >
                      <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
                      <span>Download</span>
                    </Button>
                    
                    <Link href={`/dashboard/tailor?resumeId=${resumeId}`}>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="border-purple-500/50 text-purple-400 hover:bg-purple-500/10 hover:text-purple-300 flex items-center"
                      >
                        <PencilIcon className="h-4 w-4 mr-1" />
                        <span>Tailor</span>
                      </Button>
                    </Link>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(resumeId)}
                      className="border-red-500/50 text-red-400 hover:bg-red-500/10 hover:text-red-300 flex items-center"
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