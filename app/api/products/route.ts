import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthed } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

export const runtime = 'nodejs';

export async function GET() {
  const admin = supabaseAdmin();
  const { data: products, error } = await admin
    .from('products')
    .select('*, media:product_media(*)')
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const sorted = (products || []).map((p: any) => ({
    ...p,
    media: (p.media || []).sort((a: any, b: any) => a.sort_order - b.sort_order),
  }));

  return NextResponse.json({ products: sorted });
}

export async function POST(req: NextRequest) {
  if (!isAdminAuthed()) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
  }

  const body = await req.json();
  const { name, category, material, price, description, is_available, media } = body;

  if (!name || !category) {
    return NextResponse.json({ error: 'Name and category are required' }, { status: 400 });
  }

  const admin = supabaseAdmin();
  const { data: product, error } = await admin
    .from('products')
    .insert({
      name,
      category,
      material: material || null,
      price: price === '' || price === undefined ? null : price,
      description: description || null,
      is_available: is_available !== false,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (Array.isArray(media) && media.length > 0) {
    const rows = media.map((m: { url: string; type: string }, i: number) => ({
      product_id: product.id,
      url: m.url,
      type: m.type,
      sort_order: i,
    }));
    const { error: mediaError } = await admin.from('product_media').insert(rows);
    if (mediaError) {
      return NextResponse.json({ error: mediaError.message }, { status: 500 });
    }
  }

  return NextResponse.json({ product });
}
