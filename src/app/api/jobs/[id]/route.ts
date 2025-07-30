import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { connect } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function PUT(
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

    const body = await request.json();
    const { title, company, description, requirements, preferences, location, salary } = body;

    if (!title || !company || !description || !location) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    try {
      const db = await connect();
      const result = await db.collection('job_descriptions').updateOne(
        { _id: new ObjectId(params.id), userId: user.id },
        {
          $set: {
            title,
            company,
            description,
            requirements: requirements || [],
            preferences: preferences || [],
            location,
            salary,
            updatedAt: new Date()
          }
        }
      );

      if (result.matchedCount === 0) {
        return NextResponse.json(
          { error: 'Job description not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        id: params.id,
        ...body,
        updatedAt: new Date()
      });
    } catch (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error updating job:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
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
      const result = await db.collection('job_descriptions').deleteOne({
        _id: new ObjectId(params.id),
        userId: user.id
      });

      if (result.deletedCount === 0) {
        return NextResponse.json(
          { error: 'Job description not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({ success: true });
    } catch (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error deleting job:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 