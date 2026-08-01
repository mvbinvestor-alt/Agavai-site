import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const { path, referrer } = await req.json();
    if (typeof path !== 'string' || !path.startsWith('/') || path.length > 300) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }
    // Never track the admin panel itself — that's you, not a visitor.
    if (path.startsWith('/admin')) {
      return NextResponse.json({ ok: true });
    }

    const admin = supabaseAdmin();
    await admin.from('page_views').insert({
      path,
      referrer: typeof referrer === 'string' ? referrer.slice(0, 300) : null,
    });

    return NextResponse.json({ ok: true });
  } catch {
    // Analytics should never break the site — fail silently.
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}
