'use client';

import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import type { Resume as ResumeType } from '@/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  DocumentTextIcon, 
  SparklesIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  ArrowPathIcon,
  CalendarIcon,
  TrophyIcon
} from '@heroicons/react/24/outline';

interface ResumeItem {
  _id?: string;
  id?: string;
  type: 'original' | 'tailored';
  title?: string;
  fileName?: string;
  content?: string;
  originalContent?: string;
  tailoredContent?: string;
  matchScore?: number;
  suggestedChanges?: any[];
  createdAt?: Date;
  uploadDate?: Date;
  originalResumeId?: string;
  jobDescriptionId?: string;
  jobTitle?: string;
  company?: string;
}

interface HistoryProps {
  resumes: ResumeType[];
  onSelect: (resume: ResumeType) => void;
}

export const ResumeHistory: React.FC = () => {
  const [resumes, setResumes] = React.useState<ResumeItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [filter, setFilter] = React.useState<'all' | 'original' | 'tailored'>('all');

  React.useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
    try {
      // Fetch both regular resumes and tailored resumes
      const [resumesResponse, tailoredResponse] = await Promise.all([
        fetch('/api/resumes/history'),
        fetch('/api/resumes/tailored')
      ]);

      const regularResumes = resumesResponse.ok ? await resumesResponse.json() : [];
      const tailoredResumes = tailoredResponse.ok ? await tailoredResponse.json() : [];

      // Combine and format the data
      const allResumes: ResumeItem[] = [
        ...regularResumes.map((resume: any) => ({
          ...resume,
          type: 'original' as const
        })),
        ...tailoredResumes.map((resume: any) => ({
          ...resume,
          type: 'tailored' as const
        }))
      ];

      // Sort by date (newest first)
      allResumes.sort((a, b) => {
        const dateA = new Date(a.createdAt || a.uploadDate || 0);
        const dateB = new Date(b.createdAt || b.uploadDate || 0);
        return dateB.getTime() - dateA.getTime();
      });

      setResumes(allResumes);
    } catch (error) {
      console.error('Error fetching resumes:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredResumes = resumes.filter(resume => {
    if (filter === 'all') return true;
    return resume.type === filter;
  });

  const getMatchScoreColor = (score?: number) => {
    if (!score) return 'text-slate-400';
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getMatchScoreBg = (score?: number) => {
    if (!score) return 'bg-slate-500/20 border-slate-500/30';
    if (score >= 80) return 'bg-green-500/20 border-green-500/30';
    if (score >= 60) return 'bg-yellow-500/20 border-yellow-500/30';
    return 'bg-red-500/20 border-red-500/30';
  };

  const formatDate = (dateString: string | Date) => {
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

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-700/50 rounded w-1/3 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-slate-800/50 rounded-xl"></div>
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
          <h1 className="text-3xl font-bold text-white">Resume History</h1>
          <p className="text-slate-400 mt-1">
            View all your uploaded and AI-tailored resumes
          </p>
        </div>
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
                ? 'bg-purple-500 text-white'
                : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50'
            }`}
          >
            {label} ({count})
          </button>
        ))}
      </div>

      {/* Resume List */}
      {filteredResumes.length === 0 ? (
        <Card className="p-12 text-center bg-slate-800/50 border-slate-700/50">
          <div className="flex flex-col items-center">
            {filter === 'original' ? (
              <DocumentTextIcon className="h-16 w-16 mb-4 text-slate-600" />
            ) : filter === 'tailored' ? (
              <SparklesIcon className="h-16 w-16 mb-4 text-slate-600" />
            ) : (
              <DocumentTextIcon className="h-16 w-16 mb-4 text-slate-600" />
            )}
            <h3 className="text-xl font-semibold text-white mb-2">
              {filter === 'all' ? 'No resume history found' : `No ${filter} resumes found`}
            </h3>
            <p className="text-slate-400 mb-6">
              {filter === 'original' 
                ? 'Upload your first resume to get started'
                : filter === 'tailored'
                ? 'Tailor your first resume for a job'
                : 'Start by uploading a resume!'
              }
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                onClick={() => window.location.href = '/dashboard/upload'}
                className="bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center"
                >
                <DocumentTextIcon className="h-4 w-4 mr-2 mx-auto" />
                Upload Resume
                </Button>
                <Button 
                onClick={() => window.location.href = '/dashboard/tailor'}
                variant="outline"
                className="border-slate-600/50 text-slate-300 hover:bg-slate-700/50 flex flex-col items-center justify-center"
                >
                <SparklesIcon className="h-6 w-6 mb-1 mx-auto" />
                <span>Tailor Resume</span>
                </Button>
            </div>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredResumes.map((resume) => (
            <Card
              key={resume._id || resume.id}
              className={`p-6 transition-all duration-200 hover:shadow-lg group ${
                resume.type === 'original'
                  ? 'bg-slate-800/50 border-slate-700/50 hover:bg-slate-800/70 hover:border-blue-500/30'
                  : 'bg-slate-800/50 border-slate-700/50 hover:bg-slate-800/70 hover:border-purple-500/30'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Left Section - Resume Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start space-x-4">
                    {/* Icon */}
                    <div className={`p-3 rounded-xl flex-shrink-0 ${
                      resume.type === 'original'
                        ? 'bg-blue-500/20 border border-blue-500/30'
                        : 'bg-purple-500/20 border border-purple-500/30'
                    }`}>
                      {resume.type === 'original' ? (
                        <DocumentTextIcon className="h-6 w-6 text-blue-400" />
                      ) : (
                        <SparklesIcon className="h-6 w-6 text-purple-400" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-white truncate">
                          {resume.type === 'tailored' && resume.jobTitle 
                            ? `${resume.title || 'Resume'} - ${resume.jobTitle}`
                            : resume.title || 'Untitled Resume'
                          }
                        </h3>
                        
                        {/* Type Badge */}
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          resume.type === 'original'
                            ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                            : 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                        }`}>
                          {resume.type === 'original' ? 'Original' : 'AI-Tailored'}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <p className="text-sm text-slate-400">
                          {resume.type === 'tailored' && resume.company 
                            ? `${resume.company} • ${resume.fileName || 'Text input'}`
                            : resume.fileName || 'Text input'
                          }
                        </p>
                        
                        <div className="flex items-center text-xs text-slate-500 space-x-4">
                          <div className="flex items-center space-x-1">
                            <CalendarIcon className="h-3 w-3" />
                            <span>
                              Created {formatDistanceToNow(new Date(resume.createdAt || resume.uploadDate || Date.now()))} ago
                            </span>
                          </div>
                          <span>•</span>
                          <span>{formatDate(resume.createdAt || resume.uploadDate || new Date())}</span>
                        </div>
                      </div>

                      {/* Match Score for Tailored Resumes */}
                      {resume.matchScore && (
                        <div className="mt-3">
                          <div className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium border ${getMatchScoreBg(resume.matchScore)}`}>
                            <TrophyIcon className="h-4 w-4 mr-2" />
                            <span className={getMatchScoreColor(resume.matchScore)}>
                              Match Score: {resume.matchScore}%
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Section - Actions */}
                <div className="flex flex-col sm:flex-row gap-2 flex-shrink-0">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.location.href = `/dashboard/preview/${resume._id || resume.id}`}
                    className="border-slate-600/50 text-slate-300 hover:bg-slate-700/50 hover:text-white"
                  >
                    <EyeIcon className="h-4 w-4 mr-2" />
                    Preview
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const endpoint = resume.type === 'tailored' 
                        ? `/api/resumes/tailored/${resume._id || resume.id}/download`
                        : `/api/resumes/${resume._id || resume.id}/download`;
                      window.open(endpoint);
                    }}
                    className="border-slate-600/50 text-slate-300 hover:bg-slate-700/50 hover:text-white"
                  >
                    <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                  
                  {resume.type === 'tailored' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.location.href = `/dashboard/tailor?jobId=${resume.jobDescriptionId}`}
                      className="border-purple-500/50 text-purple-400 hover:bg-purple-500/10 hover:text-purple-300"
                    >
                      <ArrowPathIcon className="h-4 w-4 mr-2" />
                      Re-tailor
                    </Button>
                  )}
                </div>
              </div>

              {/* Suggested Changes for Tailored Resumes */}
              {resume.type === 'tailored' && resume.suggestedChanges && resume.suggestedChanges.length > 0 && (
                <div className="mt-6 pt-4 border-t border-slate-700/50">
                  <h4 className="text-sm font-medium text-white mb-3 flex items-center">
                    <SparklesIcon className="h-4 w-4 mr-2 text-purple-400" />
                    AI Improvements Made
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {resume.suggestedChanges.slice(0, 4).map((change, index) => {
                      const getChangeTypeColor = (type: string) => {
                        switch (type) {
                          case 'addition': return 'text-green-400 bg-green-500/10 border-green-500/20';
                          case 'modification': return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
                          case 'removal': return 'text-red-400 bg-red-500/10 border-red-500/20';
                          default: return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
                        }
                      };

                      const getChangeIcon = (type: string) => {
                        switch (type) {
                          case 'addition': return '+ ';
                          case 'modification': return '~ ';
                          case 'removal': return '- ';
                          default: return '• ';
                        }
                      };

                      return (
                        <div 
                          key={index} 
                          className={`p-2 rounded-lg border text-xs ${getChangeTypeColor(change.type)}`}
                        >
                          <span className="font-mono font-bold mr-1">
                            {getChangeIcon(change.type)}
                          </span>
                          <span className="font-medium">{change.section}:</span>
                          <span className="ml-1 opacity-80">
                            {change.description || `${change.type} in ${change.section}`}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  {resume.suggestedChanges.length > 4 && (
                    <p className="text-xs text-slate-500 mt-2 text-center">
                      +{resume.suggestedChanges.length - 4} more improvements
                    </p>
                  )}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};