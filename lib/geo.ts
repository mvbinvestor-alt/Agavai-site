import crypto from 'crypto';
import { supabaseAdmin } from './supabase';

function hashIp(ip: string): string {
  return crypto.createHash('sha256').update(ip).digest('hex');
}

// Resolves an IP to a country, using a cache so the same visitor never
// triggers a second API call. Free tier of ipapi.co: ~30,000 lookups/month,
// no API key needed. If that ever gets tight, this is the one place to swap
// providers or add a paid key.
export async function getCountryForIp(ip: string): Promise<string | null> {
  if (!ip || ip === '127.0.0.1' || ip === '::1') return null;

  const admin = supabaseAdmin();
  const hash = hashIp(ip);

  const { data: cached } = await admin
    .from('ip_country_cache')
    .select('country')
    .eq('ip_hash', hash)
    .single();

  if (cached) return cached.country;

  try {
    const res = await fetch(`https://ipapi.co/${ip}/country_name/`, {
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) return null;
    const text = (await res.text()).trim();
    // ipapi.co returns short error strings (not JSON) for invalid/rate-limited requests
    const country = text && text.length < 60 && !text.toLowerCase().includes('error') ? text : null;

    await admin.from('ip_country_cache').insert({ ip_hash: hash, country });
    return country;
  } catch {
    return null; // never let a slow/down geo API block tracking
  }
}

// Extracts the real client IP from proxy headers (Hostinger sits behind a
// reverse proxy, so req.ip / connection IP isn't reliable — has to come from
// x-forwarded-for).
export function getClientIp(headers: Headers): string | null {
  const forwarded = headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return headers.get('x-real-ip');
}
