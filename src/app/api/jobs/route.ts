import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { connect } from '@/lib/mongodb';

export async function GET(): Promise<NextResponse> {
  try {
    console.log('Fetching jobs...');
    
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
    
    const jobs = await db.collection('job_descriptions').find({
      userId: user.id
    }).sort({ createdAt: -1 }).toArray();

    console.log('Found jobs:', jobs.length);

    // Transform MongoDB documents to proper format
    const transformedJobs = jobs.map(job => ({
      id: job._id.toString(),
      _id: job._id.toString(),
      userId: job.userId,
      title: job.title,
      company: job.company,
      description: job.description,
      requirements: job.requirements || [],
      preferences: job.preferences || [],
      location: job.location,
      salary: job.salary,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt
    }));

    return NextResponse.json(transformedJobs);
  } catch (error) {
    console.error('Error fetching jobs:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch jobs',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    console.log('Creating new job...');
    
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    console.log('Job data:', body);

    const db = await connect();
    
    const jobData = {
      userId: user.id,
      title: body.title,
      company: body.company,
      description: body.description,
      requirements: body.requirements || [],
      preferences: body.preferences || [],
      location: body.location,
      salary: body.salary,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await db.collection('job_descriptions').insertOne(jobData);
    
    const newJob = {
      id: result.insertedId.toString(),
      _id: result.insertedId.toString(),
      ...jobData
    };

    console.log('Job created:', result.insertedId);

    return NextResponse.json(newJob);
  } catch (error) {
    console.error('Error creating job:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create job',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}