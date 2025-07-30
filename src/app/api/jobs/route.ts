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
      const jobs = await db
        .collection('job_descriptions')
        .find({ userId: user.id })
        .sort({ createdAt: -1 })
        .toArray();

      // Convert MongoDB _id to string and add id field
      const formattedJobs = jobs.map(job => ({
        ...job,
        _id: job._id.toString(),
        id: job._id.toString()
      }));

      return NextResponse.json(formattedJobs);
    } catch (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error fetching jobs:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
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
      const result = await db.collection('job_descriptions').insertOne({
        userId: user.id,
        title,
        company,
        description,
        requirements: requirements || [],
        preferences: preferences || [],
        location,
        salary,
        createdAt: new Date()
      });

      return NextResponse.json({
        _id: result.insertedId.toString(),
        id: result.insertedId.toString(),
        ...body,
        createdAt: new Date()
      });
    } catch (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error creating job:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 