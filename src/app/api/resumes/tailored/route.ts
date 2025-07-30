import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { connect } from '@/lib/mongodb';

export async function GET() {
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
      const tailoredResumes = await db
        .collection('tailored_resumes')
        .find({ userId: user.id })
        .sort({ createdAt: -1 })
        .toArray();

      // Convert MongoDB _id to string and add id field
      const formattedResumes = tailoredResumes.map(resume => ({
        ...resume,
        _id: resume._id.toString(),
        id: resume._id.toString()
      }));

      return NextResponse.json(formattedResumes);
    } catch (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error fetching tailored resumes:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 