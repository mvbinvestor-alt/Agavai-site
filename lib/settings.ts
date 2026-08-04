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
