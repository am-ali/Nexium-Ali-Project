import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { connect } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(
  request: Request,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    const { id } = await params;
    const supabase = await createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = await connect();
    const tailoredResume = await db.collection('tailored_resumes').findOne({
      _id: new ObjectId(id),
      userId: user.id
    });

    if (!tailoredResume) {
      return NextResponse.json({ error: 'Tailored resume not found' }, { status: 404 });
    }

    // Create downloadable content with better formatting
    const content = tailoredResume.tailoredContent || tailoredResume.content || '';
    const fileName = `${tailoredResume.jobTitle || 'tailored-resume'}-${tailoredResume.company || 'job'}.txt`
      .replace(/[^a-z0-9.-]/gi, '_')
      .toLowerCase();
    
    return new NextResponse(content, {
      headers: {
        'Content-Type': 'text/plain',
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    });
  } catch (error) {
    console.error('Error downloading tailored resume:', error);
    return NextResponse.json(
      { error: 'Failed to download tailored resume' },
      { status: 500 }
    );
  }
}