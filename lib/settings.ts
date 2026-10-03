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
export async function getGlobalDiscountPercent(): Promise<number | null> {
  const settings = await getSettings(['global_sale_enabled', 'global_sale_percent']);
  if (settings.global_sale_enabled !== 'true') return null;
  const pct = Number(settings.global_sale_percent);
  return pct > 0 && pct < 100 ? pct : null;
}
