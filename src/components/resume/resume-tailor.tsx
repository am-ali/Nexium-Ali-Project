'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Resume, JobDescription } from '@/types';
import { 
  DocumentTextIcon, 
  BriefcaseIcon,
  SparklesIcon,
  ArrowRightIcon,
  PlusIcon
} from '@heroicons/react/24/outline';

interface ResumeTailorProps {}

const ResumeTailor: React.FC<ResumeTailorProps> = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [jobs, setJobs] = useState<JobDescription[]>([]);
  const [selectedResume, setSelectedResume] = useState<string>('');
  const [selectedJob, setSelectedJob] = useState<string>('');
  const [loadingResumes, setLoadingResumes] = useState(true);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [processing, setProcessing] = useState(false);

  // Helper functions to safely get IDs
  const getResumeId = (resume: Resume): string => {
    return resume._id || resume.id || '';
  };

  const getJobId = (job: JobDescription): string => {
    return job._id || job.id || '';
  };

  useEffect(() => {
    fetchResumes();
    fetchJobs();
    
    // Check if jobId is in URL params
    const jobId = searchParams.get('jobId');
    if (jobId) {
      setSelectedJob(jobId);
    }
  }, [searchParams]);

  const fetchResumes = async (): Promise<void> => {
    try {
      setLoadingResumes(true);
      const response = await fetch('/api/resumes/history');
      if (!response.ok) throw new Error('Failed to fetch resumes');
      const data = await response.json();
      
      // Filter to only show original resumes (not tailored ones)
      const originalResumes = data.filter(
        (resume: Resume) => !('type' in resume) || (resume as any).type !== 'tailored'
      );
      setResumes(originalResumes);
    } catch (error) {
      console.error('Error fetching resumes:', error);
      toast.error('Failed to load resumes');
    } finally {
      setLoadingResumes(false);
    }
  };

  const fetchJobs = async (): Promise<void> => {
    try {
      setLoadingJobs(true);
      const response = await fetch('/api/jobs');
      if (!response.ok) throw new Error('Failed to fetch jobs');
      const data = await response.json();
      setJobs(data);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      toast.error('Failed to load job descriptions');
    } finally {
      setLoadingJobs(false);
    }
  };

  const handleTailor = async (): Promise<void> => {
    if (!selectedResume || !selectedJob) {
      toast.error('Please select both a resume and a job description');
      return;
    }

    setProcessing(true);
    try {
      const response = await fetch('/api/resumes/tailor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeId: selectedResume,
          jobId: selectedJob
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to tailor resume');
      }

      const result = await response.json();
      toast.success('Resume tailored successfully!');
      
      // Redirect to the tailored resume preview
      router.push(`/dashboard/preview/${result.id}`);
    } catch (error) {
      console.error('Error tailoring resume:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to tailor resume');
    } finally {
      setProcessing(false);
    }
  };

  const selectedResumeData = resumes.find(r => getResumeId(r) === selectedResume);
  const selectedJobData = jobs.find(j => getJobId(j) === selectedJob);

  // Loading skeleton component
  const LoadingSkeleton = ({ items = 3 }: { items?: number }) => (
    <div className="space-y-3">
      {Array.from({ length: items }).map((_, index) => (
        <div key={index} className="p-4 border border-slate-700/50 rounded-lg animate-pulse bg-slate-800/30">
          <div className="h-4 bg-slate-700/50 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-slate-700/50 rounded w-1/2 mb-1"></div>
          <div className="h-3 bg-slate-700/50 rounded w-1/3"></div>
        </div>
      ))}
    </div>
  );

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return 'Unknown date';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white mb-2">AI Resume Tailor</h1>
        <p className="text-slate-400 max-w-2xl mx-auto">
          Select your resume and target job to create an AI-optimized version that matches the job requirements perfectly.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Resume Selection */}
        <Card className="p-6 bg-slate-800/50 border-slate-700/50">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <DocumentTextIcon className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white">Select Your Resume</h3>
              <p className="text-sm text-slate-400">Choose from your uploaded resumes</p>
            </div>
          </div>
          
          {loadingResumes ? (
            <LoadingSkeleton />
          ) : resumes.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <DocumentTextIcon className="h-16 w-16 mx-auto mb-4 text-slate-600" />
              <p className="text-lg mb-2">No original resumes found</p>
              <p className="text-sm text-slate-500 mb-4">Upload your first resume to get started</p>
              <Button 
                onClick={() => router.push('/dashboard/upload')}
                className="bg-gradient-to-r from-blue-500 to-blue-600"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Upload Resume
              </Button>
            </div>
          ) : (
            <div className="space-y-3 max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800">
              {resumes.map((resume) => {
                const resumeId = getResumeId(resume);
                const isSelected = selectedResume === resumeId;
                return (
                  <div
                    key={resumeId}
                    className={`p-4 border rounded-xl cursor-pointer transition-all duration-200 ${
                      isSelected
                        ? 'border-blue-500/50 bg-blue-500/10 shadow-lg shadow-blue-500/20'
                        : 'border-slate-700/50 hover:border-slate-600/50 hover:bg-slate-700/30'
                    }`}
                    onClick={() => resumeId && setSelectedResume(resumeId)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-white truncate">
                          {resume.title || 'Untitled Resume'}
                        </h4>
                        <p className="text-sm text-slate-400 truncate">
                          {resume.fileName || 'Text input'}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          Created {formatDate(
                            typeof resume.createdAt === 'string'
                              ? resume.createdAt
                              : typeof resume.uploadDate === 'string'
                                ? resume.uploadDate
                                : ''
                          )}
                        </p>
                      </div>
                      {isSelected && (
                        <div className="ml-3 p-1 bg-blue-500/20 rounded-full">
                          <SparklesIcon className="h-4 w-4 text-blue-400" />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Job Description Selection */}
        <Card className="p-6 bg-slate-800/50 border-slate-700/50">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <BriefcaseIcon className="h-6 w-6 text-purple-400" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white">Select Job Description</h3>
              <p className="text-sm text-slate-400">Choose your target position</p>
            </div>
          </div>
          
          {loadingJobs ? (
            <LoadingSkeleton />
          ) : jobs.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <BriefcaseIcon className="h-16 w-16 mx-auto mb-4 text-slate-600" />
              <p className="text-lg mb-2">No job descriptions found</p>
              <p className="text-sm text-slate-500 mb-4">Add your first target job</p>
              <Button 
                onClick={() => router.push('/dashboard/jobs')}
                className="bg-gradient-to-r from-purple-500 to-purple-600"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Job Description
              </Button>
            </div>
          ) : (
            <div className="space-y-3 max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800">
              {jobs.map((job) => {
                const jobId = getJobId(job);
                const isSelected = selectedJob === jobId;
                return (
                  <div
                    key={jobId}
                    className={`p-4 border rounded-xl cursor-pointer transition-all duration-200 ${
                      isSelected
                        ? 'border-purple-500/50 bg-purple-500/10 shadow-lg shadow-purple-500/20'
                        : 'border-slate-700/50 hover:border-slate-600/50 hover:bg-slate-700/30'
                    }`}
                    onClick={() => jobId && setSelectedJob(jobId)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-white truncate">{job.title}</h4>
                        <p className="text-sm text-slate-400 truncate">{job.company}</p>
                        <p className="text-xs text-slate-500 truncate">{job.location}</p>
                      </div>
                      {isSelected && (
                        <div className="ml-3 p-1 bg-purple-500/20 rounded-full">
                          <SparklesIcon className="h-4 w-4 text-purple-400" />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>

      {/* Preview Section */}
      {(selectedResumeData || selectedJobData) && (
        <Card className="p-8 bg-slate-800/50 border-slate-700/50">
          <h3 className="text-xl font-semibold text-white mb-6 text-center">Selection Preview</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {selectedResumeData && (
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <DocumentTextIcon className="h-5 w-5 text-blue-400" />
                  <h4 className="font-medium text-white">Selected Resume</h4>
                </div>
                <div className="bg-slate-700/30 p-6 rounded-xl border border-slate-600/30">
                  <p className="text-sm font-medium text-white mb-2">
                    {selectedResumeData.title || 'Untitled Resume'}
                  </p>
                  <p className="text-xs text-slate-400 mb-3">
                    {selectedResumeData.fileName || 'Text input'}
                  </p>
                  <div className="bg-slate-800/50 p-3 rounded-lg">
                    <p className="text-xs text-slate-300 line-clamp-3">
                      {(selectedResumeData.content || selectedResumeData.originalContent || '').substring(0, 200)}...
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {selectedJobData && (
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <BriefcaseIcon className="h-5 w-5 text-purple-400" />
                  <h4 className="font-medium text-white">Selected Job</h4>
                </div>
                <div className="bg-slate-700/30 p-6 rounded-xl border border-slate-600/30">
                  <p className="text-sm font-medium text-white mb-1">{selectedJobData.title}</p>
                  <p className="text-xs text-slate-400 mb-1">{selectedJobData.company}</p>
                  <p className="text-xs text-slate-500 mb-3">{selectedJobData.location}</p>
                  <div className="bg-slate-800/50 p-3 rounded-lg">
                    <p className="text-xs text-slate-300 line-clamp-3">
                      {selectedJobData.description.substring(0, 200)}...
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {selectedResumeData && selectedJobData && (
            <div className="mt-6 text-center">
              <div className="inline-flex items-center space-x-2 text-green-400 bg-green-500/10 px-4 py-2 rounded-full border border-green-500/20">
                <SparklesIcon className="h-4 w-4" />
                <span className="text-sm font-medium">Ready to tailor!</span>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Action Button */}
      <div className="text-center">
        <Button
          onClick={handleTailor}
          disabled={!selectedResume || !selectedJob || processing || loadingResumes || loadingJobs}
          className="px-12 py-4 text-lg bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 hover:from-purple-600 hover:via-blue-600 hover:to-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed"
          size="lg"
        >
          {processing ? (
            <div className="flex items-center space-x-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span>AI Processing...</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <SparklesIcon className="h-5 w-5" />
              <span>Tailor Resume with AI</span>
              <ArrowRightIcon className="h-5 w-5" />
            </div>
          )}
        </Button>
      </div>

      {/* Quick Actions */}
      <div className="flex justify-center space-x-4">
        <Button
          variant="outline"
          onClick={() => router.push('/dashboard/jobs')}
          className="border-slate-600/50 text-slate-300 hover:bg-slate-700/50"
        >
          <BriefcaseIcon className="h-4 w-4 mr-2" />
          Manage Jobs
        </Button>
        
        <Button
          variant="outline"
          onClick={() => router.push('/dashboard/upload')}
          className="border-slate-600/50 text-slate-300 hover:bg-slate-700/50"
        >
          <DocumentTextIcon className="h-4 w-4 mr-2" />
          Upload Resume
        </Button>
      </div>

      {/* Instructions */}
      <Card className="p-6 bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/20">
        <h3 className="text-lg font-semibold mb-4 text-white">How AI Tailoring Works</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mb-3">
              <span className="text-lg font-bold text-blue-400">1</span>
            </div>
            <p className="text-slate-300">Select your original resume</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mb-3">
              <span className="text-lg font-bold text-purple-400">2</span>
            </div>
            <p className="text-slate-300">Choose target job description</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-cyan-500/20 rounded-full flex items-center justify-center mb-3">
              <span className="text-lg font-bold text-cyan-400">3</span>
            </div>
            <p className="text-slate-300">AI analyzes and optimizes content</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mb-3">
              <span className="text-lg font-bold text-green-400">4</span>
            </div>
            <p className="text-slate-300">Download tailored resume</p>
          </div>
        </div>
        <p className="text-sm text-slate-400 mt-6 text-center">
          Our AI automatically matches keywords, optimizes formatting, and highlights relevant experience for maximum ATS compatibility.
        </p>
      </Card>
    </div>
  );
};

export default ResumeTailor;