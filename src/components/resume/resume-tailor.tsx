'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Resume, JobDescription } from '@/types';

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
      setResumes(data);
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
        <div key={index} className="p-4 border rounded-lg animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2 mb-1"></div>
          <div className="h-3 bg-gray-200 rounded w-1/3"></div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Resume Selection */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Select Your Resume</h3>
          
          {loadingResumes ? (
            <LoadingSkeleton />
          ) : resumes.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No resumes found.</p>
              <Button 
                className="mt-2"
                onClick={() => router.push('/dashboard/upload')}
              >
                Upload Resume
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {resumes.map((resume) => {
                const resumeId = getResumeId(resume);
                return (
                  <div
                    key={resumeId}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedResume === resumeId
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => resumeId && setSelectedResume(resumeId)}
                  >
                    <h4 className="font-medium">{resume.title || 'Untitled Resume'}</h4>
                    <p className="text-sm text-gray-600">
                      {resume.fileName || 'Text input'}
                    </p>
                    <p className="text-xs text-gray-500">
                      Created {new Date(resume.createdAt || resume.uploadDate || Date.now()).toLocaleDateString()}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Job Description Selection */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Select Job Description</h3>
          
          {loadingJobs ? (
            <LoadingSkeleton />
          ) : jobs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No job descriptions found.</p>
              <Button 
                className="mt-2"
                onClick={() => router.push('/dashboard/jobs')}
              >
                Add Job Description
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {jobs.map((job) => {
                const jobId = getJobId(job);
                return (
                  <div
                    key={jobId}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedJob === jobId
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => jobId && setSelectedJob(jobId)}
                  >
                    <h4 className="font-medium">{job.title}</h4>
                    <p className="text-sm text-gray-600">{job.company}</p>
                    <p className="text-xs text-gray-500">{job.location}</p>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>

      {/* Preview Section */}
      {(selectedResumeData || selectedJobData) && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Preview</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {selectedResumeData && (
              <div>
                <h4 className="font-medium mb-2">Selected Resume</h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm font-medium">{selectedResumeData.title || 'Untitled Resume'}</p>
                  <p className="text-xs text-gray-600 mt-1">
                    {(selectedResumeData.content || selectedResumeData.originalContent || '').substring(0, 200)}...
                  </p>
                </div>
              </div>
            )}
            
            {selectedJobData && (
              <div>
                <h4 className="font-medium mb-2">Selected Job</h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm font-medium">{selectedJobData.title}</p>
                  <p className="text-xs text-gray-600">{selectedJobData.company}</p>
                  <p className="text-xs text-gray-600 mt-1">
                    {selectedJobData.description.substring(0, 200)}...
                  </p>
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex justify-center space-x-4">
        <Button
          onClick={handleTailor}
          disabled={!selectedResume || !selectedJob || processing || loadingResumes || loadingJobs}
          className="px-8"
        >
          {processing ? 'Processing...' : 'Tailor Resume'}
        </Button>
        
        <Button
          variant="outline"
          onClick={() => router.push('/dashboard/jobs')}
        >
          Manage Jobs
        </Button>
        
        <Button
          variant="outline"
          onClick={() => router.push('/dashboard/upload')}
        >
          Upload Resume
        </Button>
      </div>

      {/* Instructions */}
      <Card className="p-6 bg-blue-50 border-blue-200">
        <h3 className="text-lg font-semibold mb-2 text-blue-900">How it works</h3>
        <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800">
          <li>Select a resume from your uploaded resumes</li>
          <li>Choose a job description you want to apply for</li>
          <li>Click &quot;Tailor Resume&quot; to generate an AI-optimized version</li>
          <li>Review and download your tailored resume</li>
        </ol>
        <p className="text-sm text-blue-700 mt-2">
          &quot;Automatically tailored to match job requirements&quot;
        </p>
      </Card>
    </div>
  );
};

export default ResumeTailor;