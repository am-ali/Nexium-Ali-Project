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
  metadata: {
    fileName?: string;
    fileType?: string;
    uploadDate: Date;
    processedDate: Date;
  };
}

export async function processUpload(data: { file?: File; text?: string }): Promise<{ 
  success: boolean; 
  data?: ProcessedResume; 
  error?: string 
}> {
  try {
    const supabase = await createClient();
    
    // Get authenticated user data
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    const userId = user.id;

    // First, ensure the storage bucket exists and has proper RLS policies
    const { data: bucketData, error: bucketError } = await supabase
      .storage
      .getBucket('resumes');

    if (bucketError) {
      // Create bucket if it doesn't exist
      await supabase.storage.createBucket('resumes', {
        public: false,
        fileSizeLimit: 10485760, // 10MB
        allowedMimeTypes: ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']
      });
    }

    // Handle file upload
    let content = '';
    let fileName = '';
    let fileType = '';

    if (data.file) {
      const buffer = await data.file.arrayBuffer();
      const fileExt = data.file.name.split('.').pop()?.toLowerCase();
      fileName = `${userId}/${Date.now()}-${data.file.name}`;

      // Upload file with proper path including user ID
      const { data: uploadData, error: uploadError } = await supabase
        .storage
        .from('resumes')
        .upload(fileName, buffer, {
          contentType: data.file.type,
          upsert: true
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      // Extract text content based on file type
      switch (fileExt) {
        case 'pdf':
          content = await extractPdfContent(buffer);
          break;
        case 'docx':
          content = await extractDocxContent(buffer);
          break;
        case 'txt':
          content = new TextDecoder().decode(buffer);
          break;
        default:
          throw new Error(`Unsupported file type: .${fileExt}`);
      }

      fileType = data.file.type;
    } else if (data.text) {
      content = data.text;
      fileName = `text-${Date.now()}.txt`;
      fileType = 'text/plain';
    } else {
      throw new Error('No content provided');
    }

    // Process with n8n
    const n8nResponse = await fetch(process.env.N8N_API_URL!, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.N8N_API_KEY}`,
      },
      body: JSON.stringify({
        content,
        userId,
        metadata: {
          fileName,
          fileType,
        }
      })
    });

    if (!n8nResponse.ok) {
      throw new Error('Processing failed');
    }

    const processedContent = await n8nResponse.json();

    // Store in MongoDB
    const mongoDb = await connect();
    const collection = mongoDb.collection('resumes');

    const resumeDoc: ProcessedResume = {
      id: `${userId}-${Date.now()}`,
      content: processedContent.result,
      originalContent: content,
      metadata: {
        fileName,
        fileType,
        uploadDate: new Date(),
        processedDate: new Date(),
      }
    };

    await collection.insertOne(resumeDoc);

    // Revalidate the page
    revalidatePath('/dashboard/upload');
    revalidatePath('/dashboard');

    return {
      success: true,
      data: resumeDoc
    };

  } catch (error) {
    console.error('Upload processing error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to process upload'
    };
  }
}

async function extractPdfContent(buffer: ArrayBuffer): Promise<string> {
  try {
    // Convert ArrayBuffer to Buffer for pdf-parse
    const data = await pdfParse(Buffer.from(buffer));
    
    // Clean up the extracted text
    return data.text
      .replace(/\r\n/g, '\n') // Normalize line endings
      .replace(/[^\S\r\n]+/g, ' ') // Replace multiple spaces with single space
      .replace(/\n{3,}/g, '\n\n') // Replace multiple blank lines with double line break
      .trim();
  } catch (error) {
    console.error('PDF extraction error:', error);
    throw new Error('Failed to extract text from PDF');
  }
}

async function extractDocxContent(buffer: ArrayBuffer): Promise<string> {
  try {
    // Convert ArrayBuffer to Buffer for mammoth
    const result = await mammoth.extractRawText({
      buffer: Buffer.from(buffer)
    });

    if (result.messages.length > 0) {
      console.warn('DOCX extraction warnings:', result.messages);
    }

    // Clean up the extracted text
    return result.value
      .replace(/\r\n/g, '\n') // Normalize line endings
      .replace(/[^\S\r\n]+/g, ' ') // Replace multiple spaces with single space
      .replace(/\n{3,}/g, '\n\n') // Replace multiple blank lines with double line break
      .trim();
  } catch (error) {
    console.error('DOCX extraction error:', error);
    throw new Error('Failed to extract text from DOCX');
  }
}