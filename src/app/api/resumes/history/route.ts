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
    
    const resumes = await db.collection('resumes').find({
      userId: user.id
    }).sort({ createdAt: -1 }).toArray();

    console.log('Found resumes:', resumes.length);

    // Transform MongoDB documents to proper format
    const transformedResumes = resumes.map(resume => ({
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
      version: resume.version
    }));

    return NextResponse.json(transformedResumes);
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