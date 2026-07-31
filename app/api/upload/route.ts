import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuid } from 'uuid';
import { isAdminAuthed } from '@/lib/auth';
import { supabaseAdmin, MEDIA_BUCKET } from '@/lib/supabase';
import { baselineEnhance } from '@/lib/imageEnhance';
import { getAiSuggestions } from '@/lib/aiEnhance';
import { applyAiAdjustments } from '@/lib/applyAiAdjustments';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  if (!(await isAdminAuthed())) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get('file') as File | null;
  const wantsAiEnhance = formData.get('enhance') === 'true';

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }

  const isVideo = file.type.startsWith('video/');
  const isImage = file.type.startsWith('image/');
  if (!isVideo && !isImage) {
    return NextResponse.json({ error: 'Only image or video files are allowed' }, { status: 400 });
  }

  // Basic size guardrails: 15MB for images, 100MB for video.
  const maxBytes = isVideo ? 100 * 1024 * 1024 : 15 * 1024 * 1024;
  if (file.size > maxBytes) {
    return NextResponse.json({ error: `File too large. Max ${isVideo ? '100MB (video)' : '15MB (image)'}.` }, { status: 400 });
  }

  let bytes = new Uint8Array(await file.arrayBuffer());
  let contentType = file.type;
  let ext = file.name.split('.').pop() || (isVideo ? 'mp4' : 'jpg');
  let suggestions = null;

  if (isImage) {
    // Stage 1: always-on baseline fix (orientation, exposure, sharpen, resize). Free, no API.
    let processed = await baselineEnhance(Buffer.from(bytes));

    // Stage 2: optional AI-assisted crop/color pass + metadata suggestions.
    if (wantsAiEnhance) {
      const ai = await getAiSuggestions(processed);
      if (ai) {
        suggestions = ai;
        const hasAdjustment =
          ai.crop || ai.brightness || ai.contrast || ai.saturation;
        if (hasAdjustment) {
          processed = await applyAiAdjustments(processed, ai);
        }
      }
    }

    bytes = new Uint8Array(processed);
    contentType = 'image/jpeg';
    ext = 'jpg';
  }

  const path = `${isVideo ? 'video' : 'image'}/${uuid()}.${ext}`;

  const admin = supabaseAdmin();
  const { error } = await admin.storage.from(MEDIA_BUCKET).upload(path, bytes, {
    contentType,
    upsert: false,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { data } = admin.storage.from(MEDIA_BUCKET).getPublicUrl(path);

  return NextResponse.json({
    url: data.publicUrl,
    path,
    type: isVideo ? 'video' : 'image',
    suggestions,
  });
}
