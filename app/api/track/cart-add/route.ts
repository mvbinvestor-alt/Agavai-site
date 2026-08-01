import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const { product_id, product_name } = await req.json();
    if (typeof product_id !== 'string' || typeof product_name !== 'string') {
      return NextResponse.json({ ok: false }, { status: 400 });
    }
    const admin = supabaseAdmin();
    await admin.from('product_interest_events').insert({
      product_id,
      product_name: product_name.slice(0, 200),
      event: 'add_to_cart',
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 200 }); // never break the cart over analytics
  }
}
