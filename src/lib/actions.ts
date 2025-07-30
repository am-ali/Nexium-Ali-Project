'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { connect } from '@/lib/mongodb';
import mammoth from 'mammoth';

// Dynamic import for pdf-parse to avoid issues
let pdfParse: any = null;

async function loadPdfParse(): Promise<boolean> {
  if (!pdfParse) {
    try {
      const pdfParseModule = await import('pdf-parse');
      pdfParse = pdfParseModule.default || pdfParseModule;
    } catch (error) {
      console.warn('pdf-parse not available, PDF parsing will be disabled');
      return false;
    }
  }
  return true;
}

interface ProcessedResume {
  id: string;
  content: string;
  originalContent: string;
  userId: string;
  metadata: {
    fileName?: string;
    fileType?: string;
    uploadDate: Date;
    processedDate: Date;
  };
}

async function extractFileContent(buffer: ArrayBuffer, fileType: string): Promise<string> {
  try {
    switch (fileType) {
      case 'application/pdf':
        const pdfParseAvailable = await loadPdfParse();
        if (!pdfParseAvailable) {
          throw new Error('PDF parsing is not available. Please install pdf-parse package.');
        }
        
        try {
          // Convert ArrayBuffer to Buffer and handle PDF directly
          const uint8Array = new Uint8Array(buffer);
          const pdfBuffer = Buffer.from(uint8Array);
          
          // Add options to prevent pdf-parse from looking for external files
          const pdfData = await pdfParse(pdfBuffer, {
            max: 0, // No page limit
          });
          
          return pdfData.text
            .replace(/\r\n/g, '\n')
            .replace(/[^\S\r\n]+/g, ' ')
            .replace(/\n{3,}/g, '\n\n')
            .trim();
        } catch (pdfError) {
          console.error('PDF parsing error:', pdfError);
          throw new Error('Failed to parse PDF file. Please ensure the file is not corrupted or try converting to DOCX format.');
        }

      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        try {
          const docxResult = await mammoth.extractRawText({
            buffer: Buffer.from(buffer)
          });
          return docxResult.value
            .replace(/\r\n/g, '\n')
            .replace(/[^\S\r\n]+/g, ' ')
            .replace(/\n{3,}/g, '\n\n')
            .trim();
        } catch (docxError) {
          console.error('DOCX parsing error:', docxError);
          throw new Error('Failed to parse DOCX file. Please ensure the file is not corrupted.');
        }

      case 'text/plain':
        return new TextDecoder().decode(buffer);

      default:
        throw new Error(`Unsupported file type: ${fileType}. Please use PDF, DOCX, or plain text files.`);
    }
  } catch (error) {
    console.error('Content extraction error:', error);
    throw error; // Re-throw to preserve the original error message
  }
}

export async function processUpload(data: { 
  fileBuffer?: ArrayBuffer;
  fileName?: string;
  fileType?: string;
  text?: string;
}): Promise<{ 
  success: boolean; 
  data?: ProcessedResume; 
  error?: string 
}> {
  try {
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    if (!data.fileBuffer && !data.text) {
      throw new Error('No content provided');
    }

    let content = data.text || '';
    let fileName = '';
    let fileType = 'text/plain';

    if (data.fileBuffer && data.fileName && data.fileType) {
      fileName = `${user.id}/${Date.now()}-${data.fileName}`;
      fileType = data.fileType;

      // Validate file type
      const supportedTypes = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain'
      ];

      if (!supportedTypes.includes(fileType)) {
        throw new Error('Unsupported file type. Please upload PDF, DOCX, or plain text files.');
      }

      // Extract content from file buffer
      content = await extractFileContent(data.fileBuffer, fileType);

      if (!content || content.trim().length === 0) {
        throw new Error('No readable content found in the file. Please ensure the file contains text.');
      }

      // Upload to Supabase Storage (optional - continue if it fails)
      try {
        const { error: uploadError } = await supabase
          .storage
          .from('resumes')
          .upload(fileName, data.fileBuffer, {
            contentType: fileType,
            upsert: false
          });

        if (uploadError) {
          console.warn('Supabase storage upload failed:', uploadError.message);
          fileName = ''; // Clear fileName since storage upload failed
        }
      } catch (storageError) {
        console.warn('Supabase storage error:', storageError);
        fileName = ''; // Clear fileName since storage upload failed
      }
    }

    // Store in MongoDB
    let resumeId = `temp_${Date.now()}`;
    try {
      const db = await connect();
      const result = await db.collection('resumes').insertOne({
        userId: user.id,
        title: data.fileName ? data.fileName.replace(/\.[^/.]+$/, '') : 'Text Resume',
        content,
        originalContent: content,
        fileName: data.fileName || undefined,
        fileType,
        uploadDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        status: 'uploaded',
        version: 1
      });
      resumeId = result.insertedId.toString();
    } catch (dbError) {
      console.error('Database error:', dbError);
      throw new Error('Failed to save resume to database. Please try again.');
    }

    revalidatePath('/dashboard');
    revalidatePath('/dashboard/history');

    return {
      success: true,
      data: {
        id: resumeId,
        content,
        originalContent: content,
        userId: user.id,
        metadata: {
          fileName: data.fileName || undefined,
          fileType,
          uploadDate: new Date(),
          processedDate: new Date()
        }
      }
    };

  } catch (error) {
    console.error('Upload processing error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to process upload'
    };
  }
}

export async function deleteResume(resumeId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    const db = await connect();
    const result = await db.collection('resumes').deleteOne({
      _id: new (await import('mongodb')).ObjectId(resumeId),
      userId: user.id
    });

    if (result.deletedCount === 0) {
      throw new Error('Resume not found or unauthorized');
    }

    revalidatePath('/dashboard');
    revalidatePath('/dashboard/history');

    return { success: true };
  } catch (error) {
    console.error('Delete resume error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete resume'
    };
  }
}