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
    const resume = await db.collection('resumes').findOne({
      _id: new ObjectId(id),
      userId: user.id
    });

    if (!resume) {
      return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
    }

    const transformedResume = {
      id: resume._id.toString(),
      _id: resume._id.toString(),
      userId: resume.userId,
      title: resume.title,
      content: resume.content,
      originalContent: resume.originalContent,
      fileName: resume.fileName,
      fileType: resume.fileType,
      createdAt: resume.createdAt,
      updatedAt: resume.updatedAt,
      status: resume.status
    };

    return NextResponse.json(transformedResume);
  } catch (error) {
    console.error('Error fetching resume:', error);
    return NextResponse.json(
      { error: 'Failed to fetch resume' },
      { status: 500 }
    );
  }
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
    
    // Delete from MongoDB
    const result = await db.collection('resumes').deleteOne({
      _id: new ObjectId(id),
      userId: user.id
    });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
    }

    // Also try to delete from Supabase storage if it exists
    try {
      const resume = await db.collection('resumes').findOne({
        _id: new ObjectId(id),
        userId: user.id
      });
      
      if (resume?.fileName) {
        await supabase.storage
          .from('resumes')
          .remove([resume.fileName]);
      }
    } catch (storageError) {
      console.warn('Failed to delete from storage:', storageError);
      // Continue even if storage deletion fails
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting resume:', error);
    return NextResponse.json(
      { error: 'Failed to delete resume' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    const { id } = await params;
    const body = await request.json();
    const supabase = await createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = await connect();
    
    const updateData = {
      ...body,
      updatedAt: new Date()
    };

    const result = await db.collection('resumes').updateOne(
      {
        _id: new ObjectId(id),
        userId: user.id
      },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
    }

    const updatedResume = await db.collection('resumes').findOne({
      _id: new ObjectId(id),
      userId: user.id
    });

    return NextResponse.json({
      id: updatedResume!._id.toString(),
      _id: updatedResume!._id.toString(),
      ...updatedResume
    });
  } catch (error) {
    console.error('Error updating resume:', error);
    return NextResponse.json(
      { error: 'Failed to update resume' },
      { status: 500 }
    );
  }
}