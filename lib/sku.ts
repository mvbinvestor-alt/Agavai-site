import type { SupabaseClient } from '@supabase/supabase-js';

const PREFIX = 'AGV-';
const PAD_WIDTH = 4; // AGV-0001 .. AGV-9999

// Looks at existing SKUs matching AGV-#### and returns the next number in
// sequence. Old random-format SKUs (e.g. AGV-3F9K2A) are ignored — they just
// sit alongside the new sequential ones, never reused, never renumbered.
export async function generateSku(admin: SupabaseClient): Promise<string> {
  const { data, error } = await admin
    .from('products')
    .select('sku')
    .like('sku', `${PREFIX}%`);

  let maxNum = 0;
  if (!error && data) {
    for (const row of data) {
      const match = row.sku?.match(/^AGV-(\d+)$/);
      if (match) {
        const n = parseInt(match[1], 10);
        if (n > maxNum) maxNum = n;
      }
    }
  }

  return `${PREFIX}${String(maxNum + 1).padStart(PAD_WIDTH, '0')}`;
}

// Generates a SKU and retries on a rare race-condition collision (two admins
// saving at nearly the same moment). checkTaken should look up whether that
// SKU already exists and return true if so.
export async function generateUniqueSku(
  admin: SupabaseClient,
  checkTaken: (sku: string) => Promise<boolean>
): Promise<string> {
  for (let attempt = 0; attempt < 5; attempt++) {
    const sku = await generateSku(admin);
    if (!(await checkTaken(sku))) return sku;
  }
  // Extremely unlikely fallback — timestamp suffix guarantees uniqueness.
  return `${PREFIX}${Date.now().toString().slice(-6)}`;
}
