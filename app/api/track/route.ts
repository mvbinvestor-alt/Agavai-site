import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getClientIp, getCountryForIp } from '@/lib/geo';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const { path, referrer } = await req.json();
    if (typeof path !== 'string' || !path.startsWith('/') || path.length > 300) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }
    // Never track the admin panel, or Hostinger's LiteSpeed cache-warming
    // probes (they hit the site with these query strings, not real visitors).
    if (path.startsWith('/admin') || path.includes('LSCWP_CTRL')) {
      return NextResponse.json({ ok: true });
    }

    const ip = getClientIp(req.headers);
    const country = ip ? await getCountryForIp(ip) : null;

    const admin = supabaseAdmin();
    await admin.from('page_views').insert({
      path,
      referrer: typeof referrer === 'string' ? referrer.slice(0, 300) : null,
      country,
    });

    return NextResponse.json({ ok: true });
  } catch {
    // Analytics should never break the site — fail silently.
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}
