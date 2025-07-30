import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { connect } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { AiService } from '@/utils/ai';
import { Resume, JobDescription } from '@/types';

export async function POST(request: Request): Promise<NextResponse> {
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
    const { resumeId, jobId } = body;

    if (!resumeId || !jobId) {
      return NextResponse.json(
        { error: 'Resume ID and Job ID are required' },
        { status: 400 }
      );
    }

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'Gemini API key is not configured.' },
        { status: 500 }
      );
    }

    try {
      const db = await connect();
      
      // Fetch the resume
      const resumeDoc = await db.collection('resumes').findOne({
        _id: new ObjectId(resumeId),
        userId: user.id
      });
      if (!resumeDoc) {
        return NextResponse.json(
          { error: 'Resume not found' },
          { status: 404 }
        );
      }
      
      // Fetch the job description
      const jobDoc = await db.collection('job_descriptions').findOne({
        _id: new ObjectId(jobId),
        userId: user.id
      });
      if (!jobDoc) {
        return NextResponse.json(
          { error: 'Job description not found' },
          { status: 404 }
        );
      }
      
      // Convert MongoDB documents to proper types
      const resume: Resume = {
        id: resumeDoc._id.toString(),
        _id: resumeDoc._id.toString(),
        userId: resumeDoc.userId,
        title: resumeDoc.title,
        content: resumeDoc.content,
        originalContent: resumeDoc.originalContent,
        fileName: resumeDoc.fileName,
        fileUrl: resumeDoc.fileUrl,
        fileType: resumeDoc.fileType,
        skills: resumeDoc.skills,
        experience: resumeDoc.experience,
        education: resumeDoc.education,
        createdAt: resumeDoc.createdAt,
        updatedAt: resumeDoc.updatedAt,
        version: resumeDoc.version,
        uploadDate: resumeDoc.uploadDate,
        status: resumeDoc.status
      };
      
      const job: JobDescription = {
        id: jobDoc._id.toString(),
        _id: jobDoc._id.toString(),
        title: jobDoc.title,
        company: jobDoc.company,
        description: jobDoc.description,
        requirements: jobDoc.requirements || [],
        preferences: jobDoc.preferences || [],
        location: jobDoc.location,
        salary: jobDoc.salary,
        createdAt: jobDoc.createdAt
      };
      
      // Use AiService to tailor the resume
      const aiService = new AiService({ apiKey: GEMINI_API_KEY });
      const tailoredResume = await aiService.tailorResume(resume, job);
      
      // Clean and format the tailored content
      const formattedContent = tailoredResume.content || tailoredResume.originalContent || '';
      
      // Save the tailored resume with proper formatting
      const tailoredResumeDoc = {
        userId: user.id,
        originalResumeId: resumeId,
        jobDescriptionId: jobId,
        title: `${resume.title || 'Resume'} - ${job.title}`,
        originalContent: resume.originalContent || resume.content,
        tailoredContent: formattedContent,
        matchScore: tailoredResume.matchScore,
        suggestedChanges: tailoredResume.suggestedChanges,
        jobTitle: job.title,
        company: job.company,
        createdAt: new Date(),
        updatedAt: new Date(),
        status: 'active'
      };
      
      const result = await db.collection('tailored_resumes').insertOne(tailoredResumeDoc);
      
      // Also update the original resume collection with a reference to this tailored version
      await db.collection('resumes').updateOne(
        { _id: new ObjectId(resumeId) },
        { 
          $addToSet: { 
            tailoredVersions: {
              id: result.insertedId.toString(),
              jobTitle: job.title,
              company: job.company,
              matchScore: tailoredResume.matchScore,
              createdAt: new Date()
            }
          },
          $set: { updatedAt: new Date() }
        }
      );
      
      return NextResponse.json({
        _id: result.insertedId.toString(),
        id: result.insertedId.toString(),
        title: tailoredResumeDoc.title,
        content: formattedContent,
        originalContent: resume.originalContent || resume.content,
        matchScore: tailoredResume.matchScore,
        suggestedChanges: tailoredResume.suggestedChanges,
        jobTitle: job.title,
        company: job.company,
        createdAt: tailoredResumeDoc.createdAt
      });
    } catch (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error tailoring resume:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}