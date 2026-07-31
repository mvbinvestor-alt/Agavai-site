import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthed } from '@/lib/auth';
import { supabaseAdmin, MEDIA_BUCKET } from '@/lib/supabase';

export const runtime = 'nodejs';

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const admin = supabaseAdmin();
  const { data: product, error } = await admin
    .from('products')
    .select('*, media:product_media(*)')
    .eq('id', id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }

  product.media = (product.media || []).sort((a: any, b: any) => a.sort_order - b.sort_order);
  return NextResponse.json({ product });
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  if (!(await isAdminAuthed())) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const { name, sku, category, material, price, quantity, description, is_available, media } = body;

  const admin = supabaseAdmin();
  const { error } = await admin
    .from('products')
    .update({
      name,
      sku: sku || null,
      category,
      material: material || null,
      price: price === '' || price === undefined ? null : price,
      quantity: quantity === '' || quantity === undefined || quantity === null ? 1 : quantity,
      description: description || null,
      is_available: is_available !== false,
    })
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (Array.isArray(media)) {
    await admin.from('product_media').delete().eq('product_id', id);
    if (media.length > 0) {
      const rows = media.map((m: { url: string; type: string }, i: number) => ({
        product_id: id,
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

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  if (!(await isAdminAuthed())) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
  }

  const { id } = await params;
  const admin = supabaseAdmin();

  const { data: mediaRows } = await admin
    .from('product_media')
    .select('url')
    .eq('product_id', id);

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

  const { error } = await admin.from('products').delete().eq('id', id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
