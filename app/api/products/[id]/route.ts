import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthed } from '@/lib/auth';
import { supabaseAdmin, MEDIA_BUCKET } from '@/lib/supabase';

export const runtime = 'nodejs';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const admin = supabaseAdmin();
  const { data: product, error } = await admin
    .from('products')
    .select('*, media:product_media(*)')
    .eq('id', params.id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }

  product.media = (product.media || []).sort((a: any, b: any) => a.sort_order - b.sort_order);
  return NextResponse.json({ product });
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  if (!isAdminAuthed()) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
  }

  const body = await req.json();
  const { name, category, material, price, description, is_available, media } = body;

  const admin = supabaseAdmin();
  const { error } = await admin
    .from('products')
    .update({
      name,
      category,
      material: material || null,
      price: price === '' || price === undefined ? null : price,
      description: description || null,
      is_available: is_available !== false,
    })
    .eq('id', params.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // If a fresh media array was supplied, replace existing media rows.
  if (Array.isArray(media)) {
    await admin.from('product_media').delete().eq('product_id', params.id);
    if (media.length > 0) {
      const rows = media.map((m: { url: string; type: string }, i: number) => ({
        product_id: params.id,
        url: m.url,
        type: m.type,
        sort_order: i,
      }));
      const { error: mediaError } = await admin.from('product_media').insert(rows);
      if (mediaError) {
        return NextResponse.json({ error: mediaError.message }, { status: 500 });
      }
    }
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  if (!isAdminAuthed()) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
  }

  const admin = supabaseAdmin();

  // Best-effort: remove stored media files too.
  const { data: mediaRows } = await admin
    .from('product_media')
    .select('url')
    .eq('product_id', params.id);

  if (mediaRows && mediaRows.length > 0) {
    const paths = mediaRows
      .map((m: { url: string }) => {
        const marker = `${MEDIA_BUCKET}/`;
        const idx = m.url.indexOf(marker);
        return idx >= 0 ? m.url.slice(idx + marker.length) : null;
      })
      .filter(Boolean) as string[];
    if (paths.length > 0) {
      await admin.storage.from(MEDIA_BUCKET).remove(paths);
    }
  }

  const { error } = await admin.from('products').delete().eq('id', params.id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
