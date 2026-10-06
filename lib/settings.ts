import { supabaseAdmin } from './supabase';

export async function getSetting(key: string, fallback = ''): Promise<string> {
  const admin = supabaseAdmin();
  const { data } = await admin.from('site_settings').select('value').eq('key', key).single();
  return data?.value ?? fallback;
}

export async function getSettings(keys: string[]): Promise<Record<string, string>> {
  const admin = supabaseAdmin();
  const { data } = await admin.from('site_settings').select('key, value').in('key', keys);
  const out: Record<string, string> = {};
  for (const row of data || []) out[row.key] = row.value ?? '';
  return out;
}

export async function setSetting(key: string, value: string): Promise<void> {
  const admin = supabaseAdmin();
  await admin.from('site_settings').upsert({ key, value, updated_at: new Date().toISOString() });
}

// The storewide "X% off everything" switch (admin: GlobalSaleToggle). Returns
// null when off/unset/invalid, otherwise a number strictly between 0 and 100.
// A product's own sale_price still takes priority over this — see lib/pricing.ts.
//
// `resolveGlobalDiscountPercent` is the pure version: pass it settings you've
// already fetched (e.g. as part of a page's single combined getSettings call)
// so you're not making a second round trip to Supabase just for these two
// keys. `getGlobalDiscountPercent` is a convenience wrapper for callers that
// haven't already fetched settings themselves.
export function resolveGlobalDiscountPercent(settings: Record<string, string>): number | null {
  if (settings.global_sale_enabled !== 'true') return null;
  const pct = Number(settings.global_sale_percent);
  return pct > 0 && pct < 100 ? pct : null;
}

export async function getGlobalDiscountPercent(): Promise<number | null> {
  const settings = await getSettings(['global_sale_enabled', 'global_sale_percent']);
  return resolveGlobalDiscountPercent(settings);
}

// Same pattern for the sale banner (admin: SaleBannerToggle / public: SaleBanner).
export const SALE_BANNER_KEYS = [
  'sale_banner_enabled',
  'sale_banner_message',
  'sale_banner_start',
  'sale_banner_end',
] as const;

export function resolveSaleBannerSettings(settings: Record<string, string>) {
  return {
    enabled: settings.sale_banner_enabled === 'true',
    message: settings.sale_banner_message || '',
    start: settings.sale_banner_start || '',
    end: settings.sale_banner_end || '',
  };
}
