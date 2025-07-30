import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { connect } from '@/lib/mongodb';

export async function GET(): Promise<NextResponse> {
  try {
    console.log('Fetching resumes history...');
    
    // Check authentication first
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.error('Auth error:', authError);
      return NextResponse.json({ error: 'Authentication failed' }, { status: 401 });
    }
    
    if (!user) {
      console.error('No user found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('User authenticated:', user.id);

    // Connect to MongoDB
    const db = await connect();
    console.log('Connected to MongoDB');
    
    // Fetch original resumes
    const originalResumes = await db.collection('resumes').find({
      userId: user.id
    }).sort({ createdAt: -1 }).toArray();

    // Fetch tailored resumes
    const tailoredResumes = await db.collection('tailored_resumes').find({
      userId: user.id
    }).sort({ createdAt: -1 }).toArray();

    console.log('Found original resumes:', originalResumes.length);
    console.log('Found tailored resumes:', tailoredResumes.length);

    // Transform original resumes
    const transformedOriginalResumes = originalResumes.map(resume => ({
      id: resume._id.toString(),
      _id: resume._id.toString(),
      userId: resume.userId,
      title: resume.title,
      content: resume.content,
      originalContent: resume.originalContent,
      fileName: resume.fileName,
      fileUrl: resume.fileUrl,
      fileType: resume.fileType,
      skills: resume.skills,
      experience: resume.experience,
      education: resume.education,
      createdAt: resume.createdAt,
      updatedAt: resume.updatedAt,
      uploadDate: resume.uploadDate,
      status: resume.status,
      version: resume.version,
      type: 'original', // Add type to distinguish
      tailoredVersions: resume.tailoredVersions || []
    }));

    // Transform tailored resumes
    const transformedTailoredResumes = tailoredResumes.map(resume => ({
      id: resume._id.toString(),
      _id: resume._id.toString(),
      userId: resume.userId,
      title: resume.title,
      content: resume.tailoredContent,
      originalContent: resume.originalContent,
      fileName: resume.fileName || `tailored-${resume.jobTitle}`,
      fileUrl: resume.fileUrl,
      fileType: 'text/plain',
      skills: resume.skills,
      experience: resume.experience,
      education: resume.education,
      createdAt: resume.createdAt,
      updatedAt: resume.updatedAt,
      uploadDate: resume.createdAt,
      status: resume.status || 'tailored',
      version: 1,
      type: 'tailored', // Add type to distinguish
      matchScore: resume.matchScore,
      suggestedChanges: resume.suggestedChanges,
      jobTitle: resume.jobTitle,
      company: resume.company,
      originalResumeId: resume.originalResumeId,
      jobDescriptionId: resume.jobDescriptionId
    }));

    // Combine and sort by creation date
    const allResumes = [...transformedOriginalResumes, ...transformedTailoredResumes]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const response = NextResponse.json(allResumes);
    
    // Add cache headers to prevent unnecessary requests
    response.headers.set('Cache-Control', 'private, max-age=60, stale-while-revalidate=30');
    
    return response;
  } catch (error) {
    console.error('Error fetching resume history:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch resume history',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}