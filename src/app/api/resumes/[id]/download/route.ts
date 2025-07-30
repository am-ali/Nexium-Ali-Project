import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { connect } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    try {
      const db = await connect();
      
      // First try to find a tailored resume
      let resume = await db.collection('tailored_resumes').findOne({
        _id: new ObjectId(params.id),
        userId: user.id
      });

      let content = '';
      let filename = '';

      if (resume) {
        content = resume.tailoredContent;
        filename = `tailored-resume-${new Date(resume.createdAt).toISOString().split('T')[0]}.txt`;
      } else {
        // If not found in tailored resumes, try regular resumes
        resume = await db.collection('resumes').findOne({
          _id: new ObjectId(params.id),
          userId: user.id
        });

        if (!resume) {
          return NextResponse.json(
            { error: 'Resume not found' },
            { status: 404 }
          );
        }

        content = resume.originalContent || resume.content || '';
        filename = resume.fileName ? `${resume.fileName}.txt` : `resume-${new Date(resume.uploadDate || Date.now()).toISOString().split('T')[0]}.txt`;
      }

      // Create response with file download headers
      const response = new NextResponse(content);
      response.headers.set('Content-Type', 'text/plain');
      response.headers.set('Content-Disposition', `attachment; filename="${filename}"`);
      
      return response;

    } catch (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error downloading resume:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 