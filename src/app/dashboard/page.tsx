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
  PlusIcon
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
      // Fetch all data in parallel
      const [resumesRes, jobsRes] = await Promise.all([
        fetch('/api/resumes/history'),
        fetch('/api/jobs')
      ]);

      const resumes = resumesRes.ok ? await resumesRes.json() : [];
      const jobs = jobsRes.ok ? await jobsRes.json() : [];

      // Calculate stats
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

      // Set recent items (limit to 3)
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
          <div className="h-32 bg-gray-200 rounded-xl mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Welcome back!</h1>
        <p className="text-blue-100 text-lg">
          Ready to create your perfect resume? Let&apos;s get started with AI-powered tailoring.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/dashboard/upload">
          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-blue-200">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <DocumentTextIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Upload Resume</h3>
                <p className="text-sm text-gray-600">Add your resume files</p>
              </div>
            </div>
          </Card>
        </Link>

        <Link href="/dashboard/jobs">
          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-green-200">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <BriefcaseIcon className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Job Descriptions</h3>
                <p className="text-sm text-gray-600">Manage target jobs</p>
              </div>
            </div>
          </Card>
        </Link>

        <Link href="/dashboard/tailor">
          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-purple-200">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <SparklesIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Tailor Resume</h3>
                <p className="text-sm text-gray-600">AI-powered matching</p>
              </div>
            </div>
          </Card>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Resumes</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalResumes}</p>
            </div>
            <DocumentTextIcon className="h-8 w-8 text-blue-500" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Job Descriptions</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalJobs}</p>
            </div>
            <BriefcaseIcon className="h-8 w-8 text-green-500" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tailored Resumes</p>
              <p className="text-2xl font-bold text-gray-900">{stats.tailoredResumes}</p>
            </div>
            <SparklesIcon className="h-8 w-8 text-purple-500" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Match Score</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.avgMatchScore > 0 ? `${stats.avgMatchScore}%` : '--%'}
              </p>
            </div>
            <ChartBarIcon className="h-8 w-8 text-orange-500" />
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Resumes</h3>
            <Link href="/dashboard/resumes">
              <Button variant="outline" size="sm">
                View All
              </Button>
            </Link>
          </div>
          <div className="space-y-3">
            {recentResumes.length === 0 ? (
              <div className="flex items-center justify-center py-8 text-gray-500">
                <div className="text-center">
                  <DocumentTextIcon className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p>No resumes yet</p>
                  <Link href="/dashboard/upload">
                    <Button size="sm" className="mt-2">
                      <PlusIcon className="h-4 w-4 mr-1" />
                      Upload First Resume
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              recentResumes.map((resume) => (
                <div key={resume.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <DocumentTextIcon className="h-5 w-5 text-gray-400" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {resume.title || 'Untitled Resume'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {resume.createdAt ? new Date(resume.createdAt).toLocaleDateString() : 'Unknown date'}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Jobs</h3>
            <Link href="/dashboard/jobs">
              <Button variant="outline" size="sm">
                View All
              </Button>
            </Link>
          </div>
          <div className="space-y-3">
            {recentJobs.length === 0 ? (
              <div className="flex items-center justify-center py-8 text-gray-500">
                <div className="text-center">
                  <BriefcaseIcon className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p>No job descriptions yet</p>
                  <Link href="/dashboard/jobs">
                    <Button size="sm" className="mt-2">
                      <PlusIcon className="h-4 w-4 mr-1" />
                      Add First Job
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              recentJobs.map((job) => (
                <div key={job.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <BriefcaseIcon className="h-5 w-5 text-gray-400" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {job.title}
                    </p>
                    <p className="text-xs text-gray-500">{job.company}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Getting Started Guide */}
      <Card className="p-6 bg-gray-50">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Getting Started</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-sm font-semibold text-blue-600">1</span>
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Upload Your Resume</h4>
              <p className="text-sm text-gray-600">Start by uploading your existing resume in PDF, DOCX, or text format.</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-sm font-semibold text-green-600">2</span>
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Add Job Descriptions</h4>
              <p className="text-sm text-gray-600">Add the job descriptions you want to apply for to get better matches.</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
              <span className="text-sm font-semibold text-purple-600">3</span>
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Tailor & Download</h4>
              <p className="text-sm text-gray-600">Use AI to tailor your resume for each job and download the optimized version.</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}