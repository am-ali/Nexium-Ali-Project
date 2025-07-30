'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  DocumentTextIcon, 
  BriefcaseIcon, 
  SparklesIcon,
  ChartBarIcon,
  ClockIcon,
  PlusIcon,
  TrophyIcon,
  FireIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface DashboardStats {
  totalResumes: number;
  totalJobs: number;
  tailoredResumes: number;
  avgMatchScore: number;
}

export default function DashboardPage(): JSX.Element {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalResumes: 0,
    totalJobs: 0,
    tailoredResumes: 0,
    avgMatchScore: 0
  });
  const [recentResumes, setRecentResumes] = useState<any[]>([]);
  const [recentJobs, setRecentJobs] = useState<any[]>([]);

  const fetchDashboardData = useCallback(async () => {
    try {
      const [resumesRes, jobsRes] = await Promise.all([
        fetch('/api/resumes/history'),
        fetch('/api/jobs')
      ]);

      const resumes = resumesRes.ok ? await resumesRes.json() : [];
      const jobs = jobsRes.ok ? await jobsRes.json() : [];

      const tailoredResumes = resumes.filter((r: any) => r.matchScore).length;
      const avgMatchScore = tailoredResumes > 0 
        ? Math.round(resumes.reduce((sum: number, r: any) => sum + (r.matchScore || 0), 0) / tailoredResumes)
        : 0;

      setStats({
        totalResumes: resumes.length,
        totalJobs: jobs.length,
        tailoredResumes,
        avgMatchScore
      });

      setRecentResumes(resumes.slice(0, 3));
      setRecentJobs(jobs.slice(0, 3));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  }, []);

  const checkAuth = useCallback(async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      router.push('/auth');
      return;
    }
    
    setUser(user);
    await fetchDashboardData();
    setLoading(false);
  }, [router, fetchDashboardData]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="animate-pulse">
          <div className="h-40 bg-slate-800/50 rounded-2xl mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-slate-800/50 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Hero Welcome Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-500 p-8 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                Welcome back! 🚀
              </h1>
              <p className="text-purple-100 text-lg max-w-2xl">
                Ready to create your perfect resume? Let&apos;s get started with AI-powered tailoring that gets you noticed.
              </p>
              <div className="mt-6 flex items-center space-x-4">
                <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                  <FireIcon className="h-5 w-5 text-orange-400" />
                  <span className="text-sm font-medium">AI-Powered</span>
                </div>
                <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                  <TrophyIcon className="h-5 w-5 text-yellow-400" />
                  <span className="text-sm font-medium">Professional</span>
                </div>
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-white/20 to-transparent backdrop-blur-sm flex items-center justify-center">
                <SparklesIcon className="h-16 w-16 text-white/80" />
              </div>
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-gradient-to-br from-purple-400/30 to-blue-500/30 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full bg-gradient-to-tr from-cyan-400/30 to-purple-500/30 blur-2xl"></div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/dashboard/upload">
          <Card className="group p-6 hover:shadow-2xl transition-all duration-300 cursor-pointer border-slate-700/50 bg-slate-800/50 backdrop-blur-sm hover:bg-slate-800/80 hover:border-purple-500/50 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10 flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl group-hover:scale-110 transition-transform duration-300">
                <DocumentTextIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-white group-hover:text-purple-300 transition-colors">Upload Resume</h3>
                <p className="text-sm text-slate-400">Add your resume files</p>
              </div>
            </div>
          </Card>
        </Link>

        <Link href="/dashboard/jobs">
          <Card className="group p-6 hover:shadow-2xl transition-all duration-300 cursor-pointer border-slate-700/50 bg-slate-800/50 backdrop-blur-sm hover:bg-slate-800/80 hover:border-blue-500/50 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10 flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl group-hover:scale-110 transition-transform duration-300">
                <BriefcaseIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-white group-hover:text-blue-300 transition-colors">Job Descriptions</h3>
                <p className="text-sm text-slate-400">Manage target jobs</p>
              </div>
            </div>
          </Card>
        </Link>

        <Link href="/dashboard/tailor">
          <Card className="group p-6 hover:shadow-2xl transition-all duration-300 cursor-pointer border-slate-700/50 bg-slate-800/50 backdrop-blur-sm hover:bg-slate-800/80 hover:border-cyan-500/50 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10 flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl group-hover:scale-110 transition-transform duration-300">
                <SparklesIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-white group-hover:text-cyan-300 transition-colors">Tailor Resume</h3>
                <p className="text-sm text-slate-400">AI-powered matching</p>
              </div>
            </div>
          </Card>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6 bg-gradient-to-br from-slate-800/50 to-slate-700/50 border-slate-600/50 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-400">Total Resumes</p>
              <p className="text-3xl font-bold text-white">{stats.totalResumes}</p>
            </div>
            <div className="p-3 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-xl">
              <DocumentTextIcon className="h-8 w-8 text-purple-400" />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-slate-800/50 to-slate-700/50 border-slate-600/50 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-400">Job Descriptions</p>
              <p className="text-3xl font-bold text-white">{stats.totalJobs}</p>
            </div>
            <div className="p-3 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl">
              <BriefcaseIcon className="h-8 w-8 text-blue-400" />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-slate-800/50 to-slate-700/50 border-slate-600/50 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-400">Tailored Resumes</p>
              <p className="text-3xl font-bold text-white">{stats.tailoredResumes}</p>
            </div>
            <div className="p-3 bg-gradient-to-br from-cyan-500/20 to-cyan-600/20 rounded-xl">
              <SparklesIcon className="h-8 w-8 text-cyan-400" />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-slate-800/50 to-slate-700/50 border-slate-600/50 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-400">Avg Match Score</p>
              <p className="text-3xl font-bold text-white">
                {stats.avgMatchScore > 0 ? `${stats.avgMatchScore}%` : '--%'}
              </p>
            </div>
            <div className="p-3 bg-gradient-to-br from-orange-500/20 to-orange-600/20 rounded-xl">
              <ChartBarIcon className="h-8 w-8 text-orange-400" />
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-white">Recent Resumes</h3>
            <Link href="/dashboard/resumes">
              <Button variant="outline" size="sm" className="border-purple-500/50 text-purple-400 hover:bg-purple-500/10">
                View All
              </Button>
            </Link>
          </div>
          <div className="space-y-3">
            {recentResumes.length === 0 ? (
              <div className="flex items-center justify-center py-12 text-slate-400">
                <div className="text-center">
                  <DocumentTextIcon className="h-16 w-16 mx-auto mb-4 text-slate-600" />
                  <p className="text-lg mb-2">No resumes yet</p>
                  <p className="text-sm text-slate-500 mb-4">Upload your first resume to get started</p>
                  <Link href="/dashboard/upload">
                    <Button size="sm" className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700">
                      <PlusIcon className="h-4 w-4 mr-2" />
                      Upload First Resume
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              recentResumes.map((resume) => (
                <div key={resume.id} className="flex items-center space-x-3 p-4 bg-slate-700/30 rounded-xl border border-slate-600/30 hover:bg-slate-700/50 transition-colors">
                  <div className="p-2 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-lg">
                    <DocumentTextIcon className="h-5 w-5 text-purple-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {resume.title || 'Untitled Resume'}
                    </p>
                    <p className="text-xs text-slate-400">
                      {resume.createdAt ? new Date(resume.createdAt).toLocaleDateString() : 'Unknown date'}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card className="p-6 bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-white">Recent Jobs</h3>
            <Link href="/dashboard/jobs">
              <Button variant="outline" size="sm" className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10">
                View All
              </Button>
            </Link>
          </div>
          <div className="space-y-3">
            {recentJobs.length === 0 ? (
              <div className="flex items-center justify-center py-12 text-slate-400">
                <div className="text-center">
                  <BriefcaseIcon className="h-16 w-16 mx-auto mb-4 text-slate-600" />
                  <p className="text-lg mb-2">No job descriptions yet</p>
                  <p className="text-sm text-slate-500 mb-4">Add your first target job</p>
                  <Link href="/dashboard/jobs">
                    <Button size="sm" className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700">
                      <PlusIcon className="h-4 w-4 mr-2" />
                      Add First Job
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              recentJobs.map((job) => (
                <div key={job.id} className="flex items-center space-x-3 p-4 bg-slate-700/30 rounded-xl border border-slate-600/30 hover:bg-slate-700/50 transition-colors">
                  <div className="p-2 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-lg">
                    <BriefcaseIcon className="h-5 w-5 text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {job.title}
                    </p>
                    <p className="text-xs text-slate-400">{job.company}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Getting Started Guide */}
      <Card className="p-8 bg-gradient-to-br from-slate-800/50 via-slate-800/30 to-slate-700/50 border-slate-600/50 backdrop-blur-sm">
        <h3 className="text-2xl font-semibold text-white mb-6">Getting Started</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-start space-x-4 p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-transparent border border-purple-500/20">
            <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-sm font-bold text-white">1</span>
            </div>
            <div>
              <h4 className="font-medium text-white mb-2">Upload Your Resume</h4>
              <p className="text-sm text-slate-400">Start by uploading your existing resume in PDF, DOCX, or text format.</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-4 p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-transparent border border-blue-500/20">
            <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
              <span className="text-sm font-bold text-white">2</span>
            </div>
            <div>
              <h4 className="font-medium text-white mb-2">Add Job Descriptions</h4>
              <p className="text-sm text-slate-400">Add the job descriptions you want to apply for to get better matches.</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-4 p-4 rounded-xl bg-gradient-to-br from-cyan-500/10 to-transparent border border-cyan-500/20">
            <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-full flex items-center justify-center">
              <span className="text-sm font-bold text-white">3</span>
            </div>
            <div>
              <h4 className="font-medium text-white mb-2">Tailor & Download</h4>
              <p className="text-sm text-slate-400">Use AI to tailor your resume for each job and download the optimized version.</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}