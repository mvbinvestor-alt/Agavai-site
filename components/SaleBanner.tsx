import { getSettings, resolveSaleBannerSettings, SALE_BANNER_KEYS } from '@/lib/settings';

type BannerSettings = ReturnType<typeof resolveSaleBannerSettings>;

// Accepts already-fetched settings (so a page that's already loading other
// settings in one batch can pass them straight in, with no extra round trip
// to Supabase). Pages that have nothing else to fetch can leave `settings`
// out and this fetches its own — same one query it always made.
export default async function SaleBanner({ settings }: { settings?: BannerSettings } = {}) {
  const resolved = settings ?? resolveSaleBannerSettings(await getSettings([...SALE_BANNER_KEYS]));

  if (!resolved.enabled) return null;

  const today = new Date().toISOString().slice(0, 10);
  if (resolved.start && today < resolved.start) return null;
  if (resolved.end && today > resolved.end) return null;

  const message = resolved.message?.trim();
  if (!message) return null;

  return <div className="sale-banner">{message}</div>;
}
