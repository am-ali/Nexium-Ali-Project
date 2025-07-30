import { NextResponse } from 'next/server';
import { processUpload } from '@/lib/actions';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const text = formData.get('text') as string | null;

    let fileBuffer: ArrayBuffer | undefined;
    let fileName: string | undefined;
    let fileType: string | undefined;

    if (file) {
      fileBuffer = await file.arrayBuffer();
      fileName = file.name;
      fileType = file.type;
    }

    const result = await processUpload({
      fileBuffer,
      fileName,
      fileType,
      text: text || undefined,
    });

    if (!result.success) {
      throw new Error(result.error);
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