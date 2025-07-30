'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { createClient } from '@/lib/supabase/server';
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
  TrophyIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import ResumeManager from '@/components/resume/resume-manager';

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

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-700/50 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-48 bg-slate-800/50 rounded-xl"></div>
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
            Manage your original and AI-tailored resumes
          </p>
        </div>
        <Link href="/dashboard/upload">
          <Button className="bg-gradient-to-r from-purple-500 to-blue-500">
            <DocumentTextIcon className="h-4 w-4 mr-2" />
            Upload New Resume
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
                ? 'bg-purple-500 text-white'
                : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50'
            }`}
          >
            {label} ({count})
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-slate-800/50 border-slate-700/50">
          <div className="flex items-center space-x-3">
            <DocumentTextIcon className="h-8 w-8 text-blue-400" />
            <div>
              <p className="text-sm text-slate-400">Total Resumes</p>
              <p className="text-xl font-bold text-white">{resumes.length}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4 bg-slate-800/50 border-slate-700/50">
          <div className="flex items-center space-x-3">
            <SparklesIcon className="h-8 w-8 text-purple-400" />
            <div>
              <p className="text-sm text-slate-400">AI-Tailored</p>
              <p className="text-xl font-bold text-white">
                {resumes.filter(r => r.type === 'tailored').length}
              </p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4 bg-slate-800/50 border-slate-700/50">
          <div className="flex items-center space-x-3">
            <TrophyIcon className="h-8 w-8 text-yellow-400" />
            <div>
              <p className="text-sm text-slate-400">Avg Match Score</p>
              <p className="text-xl font-bold text-white">
                {Math.round(
                  resumes
                    .filter(r => r.matchScore)
                    .reduce((sum, r) => sum + (r.matchScore || 0), 0) /
                  resumes.filter(r => r.matchScore).length || 0
                )}%
              </p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4 bg-slate-800/50 border-slate-700/50">
          <div className="flex items-center space-x-3">
            <ClockIcon className="h-8 w-8 text-green-400" />
            <div>
              <p className="text-sm text-slate-400">This Week</p>
              <p className="text-xl font-bold text-white">
                {resumes.filter(r => 
                  new Date(r.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                ).length}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Resume Grid */}
      {filteredResumes.length === 0 ? (
        <Card className="p-12 text-center bg-slate-800/50 border-slate-700/50">
          <DocumentTextIcon className="h-16 w-16 mx-auto mb-4 text-slate-600" />
          <h3 className="text-xl font-semibold text-white mb-2">
            {filter === 'all' ? 'No resumes found' : `No ${filter} resumes found`}
          </h3>
          <p className="text-slate-400 mb-6">
            {filter === 'original' 
              ? 'Upload your first resume to get started'
              : filter === 'tailored'
              ? 'Tailor your first resume for a job'
              : 'Upload a resume or tailor an existing one'
            }
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/dashboard/upload">
              <Button>
                <DocumentTextIcon className="h-4 w-4 mr-2" />
                Upload Resume
              </Button>
            </Link>
            <Link href="/dashboard/tailor">
              <Button variant="outline">
                <SparklesIcon className="h-4 w-4 mr-2" />
                Tailor Resume
              </Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResumes.map((resume) => (
            <Card key={resume.id} className="p-6 bg-slate-800/50 border-slate-700/50 hover:bg-slate-800/70 transition-all group">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  {resume.type === 'original' ? (
                    <div className="p-2 bg-blue-500/20 rounded-lg">
                      <DocumentTextIcon className="h-5 w-5 text-blue-400" />
                    </div>
                  ) : (
                    <div className="p-2 bg-purple-500/20 rounded-lg">
                      <SparklesIcon className="h-5 w-5 text-purple-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-white truncate">
                      {resume.title || 'Untitled Resume'}
                    </h3>
                    <p className="text-xs text-slate-400">
                      {resume.type === 'original' ? 'Original Resume' : 'AI-Tailored'}
                    </p>
                  </div>
                </div>
                
                {resume.matchScore && (
                  <div className="text-right">
                    <div className={`text-lg font-bold ${getMatchScoreColor(resume.matchScore)}`}>
                      {resume.matchScore}%
                    </div>
                    <p className="text-xs text-slate-400">Match</p>
                  </div>
                )}
              </div>

              {/* Job Info for Tailored Resumes */}
              {resume.type === 'tailored' && (
                <div className="mb-4 p-3 bg-slate-700/30 rounded-lg border border-slate-600/30">
                  <div className="flex items-center space-x-2 mb-1">
                    <BriefcaseIcon className="h-4 w-4 text-slate-400" />
                    <p className="text-sm font-medium text-white truncate">
                      {resume.jobTitle}
                    </p>
                  </div>
                  <p className="text-xs text-slate-400">{resume.company}</p>
                </div>
              )}

              {/* Tailored Versions for Original Resumes */}
              {resume.type === 'original' && resume.tailoredVersions && resume.tailoredVersions.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs text-slate-400 mb-2">
                    {resume.tailoredVersions.length} tailored version(s)
                  </p>
                  <div className="space-y-1">
                    {resume.tailoredVersions.slice(0, 2).map((version, index) => (
                      <div key={index} className="flex items-center justify-between text-xs bg-slate-700/20 rounded px-2 py-1">
                        <span className="text-slate-300 truncate">{version.jobTitle}</span>
                        <span className={`font-medium ${getMatchScoreColor(version.matchScore)}`}>
                          {version.matchScore}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between text-xs text-slate-400 mb-4">
                <span>{resume.fileName || 'Text input'}</span>
                <span>{new Date(resume.createdAt).toLocaleDateString()}</span>
              </div>

              {/* Actions */}
              <div className="flex space-x-2">
                <Link 
                  href={resume.type === 'tailored' ? `/dashboard/preview/${resume.id}` : `/dashboard/view/${resume.id}`}
                  className="flex-1"
                >
                  <Button size="sm" variant="outline" className="w-full text-xs">
                    <EyeIcon className="h-3 w-3 mr-1" />
                    View
                  </Button>
                </Link>
                
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="text-xs"
                  onClick={() => handleDownload(resume.id, resume.title, resume.type === 'original')}
                >
                  <ArrowDownTrayIcon className="h-3 w-3 mr-1" />
                  Download
                </Button>
                
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="text-xs text-red-400 hover:text-red-300"
                  onClick={() => handleDelete(resume.id, resume.type === 'original')}
                >
                  <TrashIcon className="h-3 w-3" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}