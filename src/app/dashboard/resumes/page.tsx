'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  DocumentTextIcon, 
  SparklesIcon,
  EyeIcon,
  TrashIcon,
  ArrowDownTrayIcon,
  ClockIcon,
  BriefcaseIcon,
  TrophyIcon,
  CalendarIcon,
  PlusIcon,
  PencilIcon,
  DocumentDuplicateIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';

interface Resume {
  id: string;
  _id: string;
  title: string;
  content?: string;
  fileName?: string;
  createdAt: string;
  type: 'original' | 'tailored';
  matchScore?: number;
  jobTitle?: string;
  company?: string;
  status?: string;
  tailoredVersions?: Array<{
    id: string;
    jobTitle: string;
    company: string;
    matchScore: number;
    createdAt: string;
  }>;
}

export default function ResumesPage() {
  const router = useRouter();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'original' | 'tailored'>('all');

  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
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

  // Helper function to safely format dates
  const formatDate = (dateString: string | undefined | null): string => {
    if (!dateString) return 'Unknown date';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      console.error('Date formatting error:', error);
      return 'Invalid date';
    }
  };

  // Helper function to safely calculate average
  const calculateAverageMatchScore = (): number => {
    const resumesWithScores = resumes.filter(r => r.matchScore && !isNaN(r.matchScore));
    if (resumesWithScores.length === 0) return 0;
    
    const sum = resumesWithScores.reduce((acc, r) => acc + (r.matchScore || 0), 0);
    return Math.round(sum / resumesWithScores.length);
  };

  // Helper function to safely filter resumes by date
  const getThisWeekCount = (): number => {
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    return resumes.filter(r => {
      if (!r.createdAt) return false;
      try {
        const resumeDate = new Date(r.createdAt);
        return !isNaN(resumeDate.getTime()) && resumeDate > oneWeekAgo;
      } catch {
        return false;
      }
    }).length;
  };

  const handleDelete = async (resumeId: string, isOriginal: boolean) => {
    if (!confirm('Are you sure you want to delete this resume?')) return;

    try {
      const endpoint = isOriginal ? `/api/resumes/${resumeId}` : `/api/resumes/tailored/${resumeId}`;
      const response = await fetch(endpoint, { method: 'DELETE' });
      
      if (!response.ok) throw new Error('Failed to delete resume');
      
      toast.success('Resume deleted successfully');
      fetchResumes();
    } catch (error) {
      console.error('Error deleting resume:', error);
      toast.error('Failed to delete resume');
    }
  };

  const handleDownload = async (resumeId: string, title: string, isOriginal: boolean) => {
    try {
      const endpoint = isOriginal 
        ? `/api/resumes/${resumeId}/download` 
        : `/api/resumes/tailored/${resumeId}/download`;
      
      const response = await fetch(endpoint);
      if (!response.ok) throw new Error('Failed to download resume');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('Resume downloaded successfully');
    } catch (error) {
      console.error('Error downloading resume:', error);
      toast.error('Failed to download resume');
    }
  };

  const getResumeId = (resume: Resume): string => {
    return resume._id || resume.id || '';
  };

  const filteredResumes = resumes.filter(resume => {
    if (filter === 'all') return true;
    return resume.type === filter;
  });

  const getMatchScoreColor = (score?: number) => {
    if (!score || isNaN(score)) return 'text-slate-400';
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getMatchScoreBg = (score?: number) => {
    if (!score || isNaN(score)) return 'bg-slate-500/10 border-slate-500/20';
    if (score >= 80) return 'bg-green-500/10 border-green-500/20';
    if (score >= 60) return 'bg-yellow-500/10 border-yellow-500/20';
    return 'bg-red-500/10 border-red-500/20';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-700/50 rounded w-1/3 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-slate-800/50 rounded-xl border border-slate-700/50"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">My Resumes</h1>
          <p className="text-slate-400 mt-1">
            Manage your original and AI-tailored resumes ({resumes.length} total)
          </p>
        </div>
        
        <Link href="/dashboard/upload">
            <Button className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 flex flex-col items-center justify-center">
              <PlusIcon className="h-6 w-6 mb-1" />
              <span>Upload Resume</span>
            </Button>
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {[
          { key: 'all', label: 'All Resumes', count: resumes.length },
          { key: 'original', label: 'Original', count: resumes.filter(r => r.type === 'original').length },
          { key: 'tailored', label: 'AI-Tailored', count: resumes.filter(r => r.type === 'tailored').length }
        ].map(({ key, label, count }) => (
          <button
            key={key}
            onClick={() => setFilter(key as any)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === key
                ? 'bg-purple-500 text-white shadow-lg'
                : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50 border border-slate-700/50'
            }`}
          >
            {label} ({count})
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <DocumentTextIcon className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Total Resumes</p>
              <p className="text-2xl font-bold text-white">{resumes.length}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4 bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <SparklesIcon className="h-6 w-6 text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-slate-400">AI-Tailored</p>
              <p className="text-2xl font-bold text-white">
                {resumes.filter(r => r.type === 'tailored').length}
              </p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4 bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 border-yellow-500/20">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-yellow-500/20 rounded-lg">
              <TrophyIcon className="h-6 w-6 text-yellow-400" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Avg Match Score</p>
              <p className="text-2xl font-bold text-white">
                {calculateAverageMatchScore()}%
              </p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4 bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <ClockIcon className="h-6 w-6 text-green-400" />
            </div>
            <div>
              <p className="text-sm text-slate-400">This Week</p>
              <p className="text-2xl font-bold text-white">
                {getThisWeekCount()}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Resume List */}
      {filteredResumes.length === 0 ? (
        <Card className="p-12 text-center bg-slate-800/30 border-slate-700/50">
          <div className="w-20 h-20 mx-auto mb-6 bg-slate-700/50 rounded-2xl flex items-center justify-center">
            <DocumentTextIcon className="h-10 w-10 text-slate-500" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">
            {filter === 'all' ? 'No resumes found' : `No ${filter} resumes found`}
          </h3>
          <p className="text-slate-400 mb-8 max-w-md mx-auto">
            {filter === 'original' 
              ? 'Upload your first resume to get started with AI-powered resume tailoring.'
              : filter === 'tailored'
              ? 'Tailor your first resume for a specific job to see it here.'
              : 'Upload a resume or tailor an existing one to get started.'
            }
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/dashboard/upload">
                <Button className="bg-gradient-to-r from-purple-500 to-blue-500 flex flex-col items-center justify-center">
                <PlusIcon className="h-6 w-6 mb-1" />
                <span>Upload Resume</span>
                </Button>
            </Link>
            <Link href="/dashboard/tailor">
                <Button
                variant="outline"
                className="border-slate-600/50 text-slate-300 hover:bg-slate-700/50 flex flex-col items-center justify-center"
                >
                <SparklesIcon className="h-6 w-6 mb-1" />
                <span>Tailor Resume</span>
                </Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredResumes.map((resume) => {
            const resumeId = getResumeId(resume);
            
            return (
              <Card 
                key={resumeId} 
                className="group p-6 transition-all duration-200 bg-slate-800/50 border-slate-700/50 hover:bg-slate-800/70 hover:border-slate-600/50 hover:shadow-xl hover:shadow-black/20"
              >
                <div className="flex items-start justify-between">
                  {/* Left Section: Icon, Title, Meta */}
                  <div className="flex items-start space-x-4 flex-1">
                    {/* Icon */}
                    <div className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center flex-shrink-0 ${
                      resume.type === 'original' 
                        ? 'bg-blue-500/20 border-blue-500/30' 
                        : 'bg-purple-500/20 border-purple-500/30'
                    }`}>
                      {resume.type === 'original' ? (
                        <DocumentTextIcon className="h-6 w-6 text-blue-400" />
                      ) : (
                        <SparklesIcon className="h-6 w-6 text-purple-400" />
                      )}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold text-white truncate">
                          {resume.title || 'Untitled Resume'}
                        </h3>
                        
                        {/* Type Badge */}
                        <span className={`px-2 py-1 rounded-md text-xs font-medium ${
                          resume.type === 'original' 
                            ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' 
                            : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                        }`}>
                          {resume.type === 'original' ? 'Original' : 'AI-Tailored'}
                        </span>
                        
                        {/* Match Score Badge */}
                        {resume.matchScore && !isNaN(resume.matchScore) && (
                          <span className={`px-2 py-1 rounded-md text-xs font-medium border ${getMatchScoreBg(resume.matchScore)} ${getMatchScoreColor(resume.matchScore)}`}>
                            {resume.matchScore}% match
                          </span>
                        )}
                      </div>
                      
                      {/* Metadata */}
                      <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400 mb-3">
                        <div className="flex items-center gap-1.5">
                          <CalendarIcon className="h-4 w-4" />
                          <span>{formatDate(resume.createdAt)}</span>
                        </div>
                        
                        <div className="flex items-center gap-1.5">
                          <DocumentDuplicateIcon className="h-4 w-4" />
                          <span className="truncate max-w-40">{resume.fileName || 'Text input'}</span>
                        </div>
                      </div>
                      
                      {/* Job Info for Tailored Resumes */}
                      {resume.type === 'tailored' && (resume.jobTitle || resume.company) && (
                        <div className="flex items-center gap-2 text-sm">
                          <BriefcaseIcon className="h-4 w-4 text-slate-500" />
                          <span className="text-slate-300">
                            {resume.jobTitle}
                            {resume.company && <span className="text-slate-400"> at {resume.company}</span>}
                          </span>
                        </div>
                      )}
                      
                      {/* Tailored Versions for Original Resumes */}
                      {resume.type === 'original' && resume.tailoredVersions && resume.tailoredVersions.length > 0 && (
                        <div className="mt-3">
                          <p className="text-xs text-slate-400 mb-2 flex items-center">
                            <SparklesIcon className="h-3 w-3 mr-1" />
                            {resume.tailoredVersions.length} tailored version(s)
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {resume.tailoredVersions.slice(0, 2).map((version, index) => (
                              <div key={index} className="flex items-center justify-between text-xs bg-slate-700/30 rounded-lg px-3 py-2 border border-slate-600/30">
                                <span className="text-slate-300 truncate flex-1 mr-2">{version.jobTitle}</span>
                                <span className={`font-medium flex-shrink-0 ${getMatchScoreColor(version.matchScore)}`}>
                                  {version.matchScore && !isNaN(version.matchScore) ? `${version.matchScore}%` : 'N/A'}
                                </span>
                              </div>
                            ))}
                          </div>
                          {resume.tailoredVersions.length > 2 && (
                            <p className="text-xs text-slate-500 text-center mt-2">
                              +{resume.tailoredVersions.length - 2} more versions
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Right Section: Action Buttons */}
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => router.push(resume.type === 'tailored' ? `/dashboard/preview/${resumeId}` : `/dashboard/view/${resumeId}`)}
                      className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-slate-300 bg-slate-700/50 border border-slate-600/50 rounded-lg hover:bg-slate-700 hover:text-white transition-all duration-200 hover:scale-105"
                      title="View resume"
                    >
                      <EyeIcon className="h-4 w-4 mr-2" />
                      View
                    </button>
                    
                    <button
                      onClick={() => handleDownload(resumeId, resume.title, resume.type === 'original')}
                      className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-slate-300 bg-slate-700/50 border border-slate-600/50 rounded-lg hover:bg-slate-700 hover:text-white transition-all duration-200 hover:scale-105"
                      title="Download resume"
                    >
                      <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                      Download
                    </button>
                    
                    <button
                      onClick={() => router.push(`/dashboard/tailor?resumeId=${resumeId}`)}
                      className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-purple-400 bg-purple-500/10 border border-purple-500/50 rounded-lg hover:bg-purple-500/20 hover:text-purple-300 transition-all duration-200 hover:scale-105"
                      title="Tailor resume"
                    >
                      <PencilIcon className="h-4 w-4 mr-2" />
                      Tailor
                    </button>
                    
                    <button
                      onClick={() => handleDelete(resumeId, resume.type === 'original')}
                      className="inline-flex items-center justify-center w-10 h-10 text-red-400 bg-red-500/10 border border-red-500/50 rounded-lg hover:bg-red-500/20 hover:text-red-300 transition-all duration-200 hover:scale-105"
                      title="Delete resume"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}