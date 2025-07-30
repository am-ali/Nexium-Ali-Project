import { NextResponse } from 'next/server';
import { processUpload } from '@/lib/actions';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const text = formData.get('text') as string | null;

    // Convert File to ArrayBuffer before processing
    let fileBuffer: ArrayBuffer | undefined;
    if (file) {
      fileBuffer = await file.arrayBuffer();
    }

    const result = await processUpload({
      fileBuffer,
      fileName: file?.name,
      fileType: file?.type,
      text: text || undefined,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Upload processing failed' },
        { status: 400 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Upload failed' },
      { status: 500 }
    );
  }
}