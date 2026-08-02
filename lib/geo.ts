import crypto from 'crypto';
import { supabaseAdmin } from './supabase';

function hashIp(ip: string): string {
  return crypto.createHash('sha256').update(ip).digest('hex');
}

// Resolves an IP to a country, using a cache so the same visitor never
// triggers a second API call. Free tier of ipapi.co: ~30,000 lookups/month,
// no API key needed. Returns a diagnostic string instead of null on failure,
// so failures are visible in the admin dashboard instead of just "Unknown".
export async function getCountryForIp(ip: string | null): Promise<string> {
  if (!ip) return 'Unknown (no IP detected)';
  if (ip === '127.0.0.1' || ip === '::1') return 'Unknown (internal request)';

  const admin = supabaseAdmin();
  const hash = hashIp(ip);

  const { data: cached } = await admin
    .from('ip_country_cache')
    .select('country')
    .eq('ip_hash', hash)
    .single();

  if (cached?.country) return cached.country;

  try {
    const res = await fetch(`https://ipapi.co/${ip}/country_name/`, {
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) {
      return `Unknown (lookup HTTP ${res.status})`;
    }
    const text = (await res.text()).trim();
    const looksValid = text && text.length < 60 && !text.toLowerCase().includes('error') && !/^\d+$/.test(text);
    const country = looksValid ? text : `Unknown (bad response: ${text.slice(0, 30)})`;

    if (looksValid) {
      await admin.from('ip_country_cache').insert({ ip_hash: hash, country });
    }
    return country;
  } catch (err: any) {
    return `Unknown (${err?.name || 'lookup failed'})`;
  }
}

// Extracts the real client IP from proxy headers. Different hosts/proxies use
// different header names, so we check the common ones in order.
export function getClientIp(headers: Headers): string | null {
  const candidates = [
    'x-forwarded-for',
    'x-real-ip',
    'cf-connecting-ip',
    'true-client-ip',
    'fastly-client-ip',
    'x-client-ip',
  ];
  for (const name of candidates) {
    const val = headers.get(name);
    if (val) return val.split(',')[0].trim();
  }
  return null;
}
