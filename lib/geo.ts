import crypto from 'crypto';
import { supabaseAdmin } from './supabase';

function hashIp(ip: string): string {
  return crypto.createHash('sha256').update(ip).digest('hex');
}

// Resolves an IP to a country, using a cache so the same visitor never
// triggers a second API call. Uses freeipapi.com (free, no API key, ~60
// lookups/minute) — switched from ipapi.co, whose free tier dropped to
// 1,000/day and was returning 429 for nearly all lookups on this host.
// Returns a diagnostic string instead of null on failure, so failures are
// visible in the admin dashboard instead of just "Unknown".
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
    const res = await fetch(`https://free.freeipapi.com/api/v1/json/${ip}`, {
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) {
      return `Unknown (lookup HTTP ${res.status})`;
    }
    const data = await res.json();
    const text = (data?.countryName || '').trim();
    const looksValid = text && text.length < 60 && !/^\d+$/.test(text);
    const country = looksValid ? text : `Unknown (bad response)`;

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
