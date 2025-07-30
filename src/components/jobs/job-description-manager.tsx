'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { JobDescription } from '@/types';

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

  const fetchJobs = async () => {
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

  const handleSubmit = async (e: React.FormEvent) => {
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

      const url = editingJob ? `/api/jobs/${editingJob.id}` : '/api/jobs';
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

  const handleEdit = (job: JobDescription) => {
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

  const handleDelete = async (jobId: string) => {
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

  const resetForm = () => {
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

  if (loading && jobs.length === 0) {
    return <div className="animate-pulse space-y-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="h-32 bg-gray-200 rounded-lg" />
      ))}
    </div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Manage Job Descriptions</h2>
        <Button onClick={() => setShowForm(true)}>
          Add Job Description
        </Button>
      </div>

      {showForm && (
        <Card className="p-6">
          <h3 className="text-lg font-medium mb-4">
            {editingJob ? 'Edit Job Description' : 'Add New Job Description'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Job Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
              <Input
                label="Company"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                required
              />
            </div>
            
            <Input
              label="Location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              required
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Job Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Requirements (one per line)
              </label>
              <textarea
                value={formData.requirements}
                onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., 3+ years of experience&#10;Proficiency in JavaScript&#10;Bachelor's degree in Computer Science"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preferred Qualifications (one per line)
              </label>
              <textarea
                value={formData.preferences}
                onChange={(e) => setFormData({ ...formData, preferences: e.target.value })}
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Experience with React&#10;Master's degree&#10;Agile methodology experience"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Min Salary"
                type="number"
                value={formData.salaryMin}
                onChange={(e) => setFormData({ ...formData, salaryMin: e.target.value })}
              />
              <Input
                label="Max Salary"
                type="number"
                value={formData.salaryMax}
                onChange={(e) => setFormData({ ...formData, salaryMax: e.target.value })}
              />
              <select
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
                <option value="CAD">CAD</option>
              </select>
            </div>

            <div className="flex space-x-3">
              <Button type="submit" disabled={loading}>
                {editingJob ? 'Update' : 'Add'} Job Description
              </Button>
              <Button 
                type="button" 
                variant="outline"
                onClick={() => {
                  setShowForm(false);
                  setEditingJob(null);
                  resetForm();
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div className="space-y-4">
        {jobs.length === 0 ? (
          <Card className="p-6 text-center text-gray-500">
            No job descriptions found. Add your first job description to get started!
          </Card>
        ) : (
          jobs.map((job) => (
            <Card key={job._id || job.id} className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">{job.title}</h3>
                  <p className="text-gray-600">{job.company} • {job.location}</p>
                  <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                    {job.description}
                  </p>
                  {job.salary && (
                    <p className="text-sm text-gray-600 mt-1">
                      Salary: {job.salary.min.toLocaleString()} - {job.salary.max.toLocaleString()} {job.salary.currency}
                    </p>
                  )}
                </div>
                <div className="flex space-x-2 ml-4">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(job)}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.location.href = `/dashboard/tailor?jobId=${job._id || job.id}`}
                  >
                    Tailor Resume
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(job._id || job.id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default JobDescriptionManager; 