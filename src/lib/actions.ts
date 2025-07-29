'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { connect } from '@/lib/mongodb';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';

interface ProcessedResume {
  id: string;
  content: string;
  originalContent: string;
  userId: string;  // Add this line
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
        const pdfData = await pdfParse(Buffer.from(buffer));
        return pdfData.text
          .replace(/\r\n/g, '\n')
          .replace(/[^\S\r\n]+/g, ' ')
          .replace(/\n{3,}/g, '\n\n')
          .trim();

      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        const docxResult = await mammoth.extractRawText({
          buffer: Buffer.from(buffer)
        });
        return docxResult.value
          .replace(/\r\n/g, '\n')
          .replace(/[^\S\r\n]+/g, ' ')
          .replace(/\n{3,}/g, '\n\n')
          .trim();

      default:
        throw new Error('Unsupported file type');
    }
  } catch (error) {
    console.error('Content extraction error:', error);
    throw new Error('Failed to extract content from file');
  }
}

export async function processUpload(data: { file?: File; text?: string }): Promise<{ 
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

    if (!data.file && !data.text) {
      throw new Error('No content provided');
    }

    let content = data.text || '';
    let fileName = '';
    let fileType = 'text/plain';

    if (data.file) {
      const buffer = await data.file.arrayBuffer();
      fileName = `${user.id}/${Date.now()}-${data.file.name}`;
      fileType = data.file.type;

      // Extract content from file
      content = await extractFileContent(buffer, fileType);

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase
        .storage
        .from('resumes')
        .upload(fileName, buffer, {
          contentType: fileType,
          upsert: false
        });

      if (uploadError) {
        throw new Error(`Upload failed: ${uploadError.message}`);
      }
    }

    // Store in MongoDB
    const db = await connect();
    const result = await db.collection('resumes').insertOne({
      userId: user.id,
      originalContent: content,
      fileName,
      fileType,
      uploadDate: new Date(),
      status: 'uploaded'
    });

    revalidatePath('/dashboard');

    return {
      success: true,
      data: {
        id: result.insertedId.toString(),
        content,
        originalContent: content,
        userId: user.id,
        metadata: {
          fileName,
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