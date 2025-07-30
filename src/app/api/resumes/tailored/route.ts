import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { connect } from '@/lib/mongodb';

export async function GET(): Promise<NextResponse> {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = await connect();
    
    const tailoredResumes = await db.collection('tailored_resumes').find({
      userId: user.id
    }).sort({ createdAt: -1 }).toArray();

    const transformedResumes = tailoredResumes.map(resume => ({
      id: resume._id.toString(),
      _id: resume._id.toString(),
      userId: resume.userId,
      title: resume.title,
      content: resume.tailoredContent,
      originalContent: resume.originalContent,
      matchScore: resume.matchScore,
      suggestedChanges: resume.suggestedChanges,
      jobTitle: resume.jobTitle,
      company: resume.company,
      originalResumeId: resume.originalResumeId,
      jobDescriptionId: resume.jobDescriptionId,
      createdAt: resume.createdAt,
      updatedAt: resume.updatedAt,
      status: resume.status || 'tailored'
    }));

    return NextResponse.json(transformedResumes);
  } catch (error) {
    console.error('Error fetching tailored resumes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tailored resumes' },
      { status: 500 }
    );
  }
}