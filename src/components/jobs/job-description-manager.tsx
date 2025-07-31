'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { JobDescription } from '@/types';
import { 
  BriefcaseIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  SparklesIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  BuildingOfficeIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

interface JobDescriptionManagerProps {}

const JobDescriptionManager: React.FC<JobDescriptionManagerProps> = () => {
  const [jobs, setJobs] = useState<JobDescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingJob, setEditingJob] = useState<JobDescription | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    description: '',
    requirements: '',
    preferences: '',
    location: '',
    salaryMin: '',
    salaryMax: '',
    currency: 'USD'
  });

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async (): Promise<void> => {
    try {
      const response = await fetch('/api/jobs');
      if (!response.ok) throw new Error('Failed to fetch jobs');
      const data = await response.json();
      setJobs(data);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      toast.error('Failed to load job descriptions');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setLoading(true);

    try {
      const jobData = {
        ...formData,
        requirements: formData.requirements.split('\n').filter(req => req.trim()),
        preferences: formData.preferences.split('\n').filter(pref => pref.trim()),
        salary: formData.salaryMin && formData.salaryMax ? {
          min: parseInt(formData.salaryMin),
          max: parseInt(formData.salaryMax),
          currency: formData.currency
        } : undefined
      };

      const jobId = editingJob?._id || editingJob?.id;
      const url = editingJob ? `/api/jobs/${jobId}` : '/api/jobs';
      const method = editingJob ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(jobData)
      });

      if (!response.ok) throw new Error('Failed to save job description');

      toast.success(editingJob ? 'Job description updated!' : 'Job description added!');
      setShowForm(false);
      setEditingJob(null);
      resetForm();
      fetchJobs();
    } catch (error) {
      console.error('Error saving job:', error);
      toast.error('Failed to save job description');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (job: JobDescription): void => {
    setEditingJob(job);
    setFormData({
      title: job.title,
      company: job.company,
      description: job.description,
      requirements: (job.requirements || []).join('\n'),
      preferences: (job.preferences || []).join('\n'),
      location: job.location,
      salaryMin: job.salary?.min?.toString() || '',
      salaryMax: job.salary?.max?.toString() || '',
      currency: job.salary?.currency || 'USD'
    });
    setShowForm(true);
  };

  const handleDelete = async (jobId: string): Promise<void> => {
    if (!confirm('Are you sure you want to delete this job description?')) return;

    try {
      const response = await fetch(`/api/jobs/${jobId}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete job description');

      toast.success('Job description deleted!');
      fetchJobs();
    } catch (error) {
      console.error('Error deleting job:', error);
      toast.error('Failed to delete job description');
    }
  };

  const resetForm = (): void => {
    setFormData({
      title: '',
      company: '',
      description: '',
      requirements: '',
      preferences: '',
      location: '',
      salaryMin: '',
      salaryMax: '',
      currency: 'USD'
    });
  };

  // Helper function to get job ID safely
  const getJobId = (job: JobDescription): string => {
    return job._id || job.id || '';
  };

  const formatSalary = (salary: { min: number; max: number; currency: string }) => {
    return `${salary.min.toLocaleString()} - ${salary.max.toLocaleString()} ${salary.currency}`;
  };

  if (loading && jobs.length === 0) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-700/50 rounded w-1/3 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
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
          <h1 className="text-3xl font-bold text-white">Job Descriptions</h1>
          <p className="text-slate-400 mt-1">
            Manage target positions for resume tailoring
          </p>
        </div>
        <Button 
          onClick={() => setShowForm(true)}
          className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 flex items-center justify-center"
        >
          <PlusIcon className="h-4 w-4 mr-2 mx-auto" />
          Add Job Description
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 bg-slate-800/50 border-slate-700/50">
          <div className="flex items-center space-x-3">
            <BriefcaseIcon className="h-8 w-8 text-purple-400" />
            <div>
              <p className="text-sm text-slate-400">Total Jobs</p>
              <p className="text-xl font-bold text-white">{jobs.length}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4 bg-slate-800/50 border-slate-700/50">
          <div className="flex items-center space-x-3">
            <BuildingOfficeIcon className="h-8 w-8 text-blue-400" />
            <div>
              <p className="text-sm text-slate-400">Companies</p>
              <p className="text-xl font-bold text-white">
                {new Set(jobs.map(job => job.company)).size}
              </p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4 bg-slate-800/50 border-slate-700/50">
          <div className="flex items-center space-x-3">
            <CurrencyDollarIcon className="h-8 w-8 text-green-400" />
            <div>
              <p className="text-sm text-slate-400">With Salary</p>
              <p className="text-xl font-bold text-white">
                {jobs.filter(job => job.salary).length}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-800/95 backdrop-blur-xl border-slate-700/50">
            <div className="p-6 border-b border-slate-700/50 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-white">
                {editingJob ? 'Edit Job Description' : 'Add New Job Description'}
              </h3>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingJob(null);
                  resetForm();
                }}
                className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors"
              >
                <XMarkIcon className="h-5 w-5 text-slate-400" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Job Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full p-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="e.g., Senior Software Engineer"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Company *
                  </label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="w-full p-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="e.g., Google"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Location *
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full p-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="e.g., San Francisco, CA or Remote"
                  required
                />
              </div>

              {/* Job Description */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Job Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="w-full p-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-vertical"
                  placeholder="Paste the full job description here..."
                  required
                />
              </div>

              {/* Requirements and Preferences */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Requirements (one per line)
                  </label>
                  <textarea
                    value={formData.requirements}
                    onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                    rows={4}
                    className="w-full p-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-vertical"
                    placeholder="3+ years of experience&#10;Proficiency in JavaScript&#10;Bachelor's degree in Computer Science"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Preferred Qualifications (one per line)
                  </label>
                  <textarea
                    value={formData.preferences}
                    onChange={(e) => setFormData({ ...formData, preferences: e.target.value })}
                    rows={4}
                    className="w-full p-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-vertical"
                    placeholder="Experience with React&#10;Master's degree&#10;Agile methodology experience"
                  />
                </div>
              </div>

              {/* Salary */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">
                  Salary Range (Optional)
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <input
                      type="number"
                      value={formData.salaryMin}
                      onChange={(e) => setFormData({ ...formData, salaryMin: e.target.value })}
                      className="w-full p-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Min Salary"
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      value={formData.salaryMax}
                      onChange={(e) => setFormData({ ...formData, salaryMax: e.target.value })}
                      className="w-full p-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Max Salary"
                    />
                  </div>
                  <div>
                    <select
                      value={formData.currency}
                      onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                      className="w-full p-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                      <option value="CAD">CAD</option>
                      <option value="AUD">AUD</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-700/50">
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                >
                  {loading ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                      <span>Saving...</span>
                    </div>
                  ) : (
                    <>
                      {editingJob ? 'Update' : 'Add'} Job Description
                    </>
                  )}
                </Button>
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    setEditingJob(null);
                    resetForm();
                  }}
                  className="border-slate-600/50 text-slate-300 hover:bg-slate-700/50"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Job List */}
      <div className="space-y-4">
        {jobs.length === 0 ? (
          <Card className="p-12 text-center bg-slate-800/50 border-slate-700/50">
            <BriefcaseIcon className="h-16 w-16 mx-auto mb-4 text-slate-600" />
            <h3 className="text-xl font-semibold text-white mb-2">No job descriptions found</h3>
            <p className="text-slate-400 mb-6">
              Add your first target job description to start tailoring resumes
            </p>
            <Button 
              onClick={() => setShowForm(true)}
              className="bg-gradient-to-r from-purple-500 to-blue-500"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Your First Job
            </Button>
          </Card>
        ) : (
          jobs.map((job) => {
            const jobId = getJobId(job);
            return (
              <Card key={jobId} className="p-6 bg-slate-800/50 border-slate-700/50 hover:bg-slate-800/70 transition-all group">
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  {/* Job Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start space-x-4">
                      <div className="p-3 bg-purple-500/20 rounded-xl border border-purple-500/30 flex-shrink-0">
                        <BriefcaseIcon className="h-6 w-6 text-purple-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-white mb-1">{job.title}</h3>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400 mb-3">
                          <div className="flex items-center space-x-1">
                            <BuildingOfficeIcon className="h-4 w-4" />
                            <span>{job.company}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <MapPinIcon className="h-4 w-4" />
                            <span>{job.location}</span>
                          </div>
                          {job.salary && (
                            <div className="flex items-center space-x-1">
                              <CurrencyDollarIcon className="h-4 w-4" />
                              <span>{formatSalary(job.salary)}</span>
                            </div>
                          )}
                        </div>
                        <p className="text-sm text-slate-300 line-clamp-2 mb-3">
                          {job.description}
                        </p>
                        
                        {/* Requirements/Preferences Preview */}
                        <div className="flex flex-wrap gap-2">
                          {job.requirements?.slice(0, 3).map((req, index) => (
                            <span key={index} className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-blue-500/20 text-blue-400 border border-blue-500/30">
                              {req}
                            </span>
                          ))}
                          {job.requirements && job.requirements.length > 3 && (
                            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-slate-500/20 text-slate-400 border border-slate-500/30">
                              +{job.requirements.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row gap-2 flex-shrink-0">
                    <Button
                      size="sm"
                      onClick={() => window.location.href = `/dashboard/tailor?jobId=${jobId}`}
                      className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                    >
                      <SparklesIcon className="h-4 w-4 mr-2" />
                      Tailor Resume
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(job)}
                      className="border-slate-600/50 text-slate-300 hover:bg-slate-700/50 flex items-center justify-center"
                    >
                      <PencilIcon className="h-4 w-4 mr-2 mx-auto" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(jobId)}
                      disabled={!jobId}
                      className="border-red-500/50 text-red-400 hover:bg-red-500/10 flex items-center justify-center"
                    >
                      <TrashIcon className="h-4 w-4 mx-auto" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};

export default JobDescriptionManager;