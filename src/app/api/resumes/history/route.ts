import { NextResponse } from 'next/server';
import { connect } from '@/lib/mongodb';
import { headers } from 'next/headers';

export async function GET() {
  try {
    const headersList = headers();
    const userId = headersList.get('x-user-id');

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const db = await connect();
    const resumes = await db
      .collection('resumes')
      .find({ userId })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json(resumes);
  } catch (error) {
    console.error('Error fetching resumes:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}