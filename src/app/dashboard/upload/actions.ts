'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';

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

export async function uploadResume(data: { file?: File; text?: string }): Promise<{ 
  success: boolean; 
  data?: ProcessedResume; 
  error?: string 
}> {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    throw new Error('Unauthorized');
  }

  try {
    let content = '';
    let fileName = '';
    let fileType = '';

    if (data.file) {
      // Handle file upload
      const buffer = await data.file.arrayBuffer();
      const fileExt = data.file.name.split('.').pop();
      fileName = `${session.user.id}-${Date.now()}.${fileExt}`;

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase
        .storage
        .from('resumes')
        .upload(`uploads/${fileName}`, buffer, {
          contentType: data.file.type,
          upsert: true
        });

      if (uploadError) {
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      // Get file content based on type
      if (data.file.type === 'application/pdf') {
        content = await extractTextFromPDF(buffer);
      } else if (data.file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        content = await extractTextFromDOCX(buffer);
      } else {
        // Assume it's plain text
        content = await data.file.text();
      }

      fileType = data.file.type;
    } else if (data.text) {
      content = data.text;
      fileName = `text-${Date.now()}.txt`;
      fileType = 'text/plain';
    } else {
      throw new Error('No content provided');
    }

    // Process with n8n for AI enhancement
    const n8nResponse = await fetch(process.env.N8N_API_URL!, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.N8N_API_KEY}`,
      },
      body: JSON.stringify({
        content,
        userId: session.user.id,
        metadata: {
          fileName,
          fileType,
        }
      })
    });

    if (!n8nResponse.ok) {
      throw new Error('Failed to process resume with AI');
    }

    const processedContent = await n8nResponse.json();

    // Store in Supabase Database
    const { data: resumeData, error: dbError } = await supabase
      .from('resumes')
      .insert({
        user_id: session.user.id,
        original_content: content,
        processed_content: processedContent.result,
        file_name: fileName,
        file_type: fileType,
        upload_date: new Date().toISOString(),
        processed_date: new Date().toISOString()
      })
      .select()
      .single();

    if (dbError) {
      throw new Error(`Database error: ${dbError.message}`);
    }

    // Revalidate pages
    revalidatePath('/dashboard/upload');
    revalidatePath('/dashboard');

    return {
      success: true,
      data: {
        id: resumeData.id,
        content: processedContent.result,
        originalContent: content,
        userId: session.user.id,
        metadata: {
          fileName,
          fileType,
          uploadDate: new Date(resumeData.upload_date),
          processedDate: new Date(resumeData.processed_date)
        }
      }
    };

  } catch (error) {
    console.error('Upload error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to upload resume'
    };
  }
}

async function extractTextFromPDF(buffer: ArrayBuffer): Promise<string> {
  try {
    // Convert ArrayBuffer to Buffer for pdf-parse
    const data = await pdfParse(Buffer.from(buffer));
    return data.text;
  } catch (error) {
    console.error('PDF extraction error:', error);
    throw new Error('Failed to extract text from PDF');
  }
}

async function extractTextFromDOCX(buffer: ArrayBuffer): Promise<string> {
  try {
    // Convert ArrayBuffer to Buffer for mammoth
    const result = await mammoth.extractRawText({
      buffer: Buffer.from(buffer)
    });
    
    if (result.value) {
      // Clean up the extracted text
      return result.value
        .replace(/\r\n/g, '\n') // Normalize line endings
        .replace(/\n{3,}/g, '\n\n') // Remove excessive blank lines
        .trim();
    }

    if (result.messages.length > 0) {
      console.warn('DOCX extraction warnings:', result.messages);
    }

    return result.value || '';
  } catch (error) {
    console.error('DOCX extraction error:', error);
    throw new Error('Failed to extract text from DOCX');
  }
}