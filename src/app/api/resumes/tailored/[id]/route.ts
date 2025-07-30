import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { connect } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function DELETE(
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
    
    // Get the tailored resume to find the original resume ID
    const tailoredResume = await db.collection('tailored_resumes').findOne({
      _id: new ObjectId(id),
      userId: user.id
    });

    if (!tailoredResume) {
      return NextResponse.json({ error: 'Tailored resume not found' }, { status: 404 });
    }

    // Delete the tailored resume
    const result = await db.collection('tailored_resumes').deleteOne({
      _id: new ObjectId(id),
      userId: user.id
    });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Failed to delete tailored resume' }, { status: 404 });
    }

    // Remove reference from original resume
    if (tailoredResume.originalResumeId) {
      await db.collection('resumes').updateOne(
        { _id: new ObjectId(tailoredResume.originalResumeId) },
        { 
          $pull: { 
            tailoredVersions: { id: id }
          },
          $set: { updatedAt: new Date() }
        }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting tailored resume:', error);
    return NextResponse.json(
      { error: 'Failed to delete tailored resume' },
      { status: 500 }
    );
  }
}