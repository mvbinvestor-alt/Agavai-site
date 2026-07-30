import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Public client — safe to use in the browser. Can only read data
// (Row Level Security policies only allow public SELECT on products/media).
export const supabasePublic = createClient(url, anonKey);

// Server-only client — uses the service role key, which bypasses Row
// Level Security. NEVER import this file from a "use client" component.
// Only used inside API routes / server actions, after the admin
// password cookie has already been checked.
export function supabaseAdmin() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, serviceKey, {
    auth: { persistSession: false },
  });
}

export const MEDIA_BUCKET = 'product-media';
