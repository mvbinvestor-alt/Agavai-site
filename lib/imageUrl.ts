// Helpers for serving right-sized copies of product photos.
//
// Originals live in Supabase Storage (up to 1600px, ~400 KB each). Showing one of those in a
// 60px thumbnail wastes bandwidth, and every page view re-downloads it from Supabase, which is
// what counts against the free "Cached Egress" quota. Instead we route photos through the
// site's own Next.js image optimizer (/_next/image): it fetches each original from Supabase
// ONCE, shrinks it, and keeps the small copy on our server for a month. Browsers then also
// cache the small copy. Allowed widths are fixed in next.config.js (deviceSizes + imageSizes),
// so only use widths from that list here.

export const IMG_WIDTHS = {
  tiny: 128, // admin / cart / gallery thumbnails
  small: 256,
  card: 384, // shop grid cards (1x)
  cardLarge: 640, // shop grid cards (2x) and gallery on phones (1x)
  detail: 828, // product page main photo
  detailLarge: 1200, // product page main photo (high-density screens)
} as const;

function isSupabasePhoto(url: string): boolean {
  return /^https:\/\/[^/]+\.supabase\.co\/storage\/v1\/object\/public\//.test(url);
}

/** Returns a URL for a resized copy of `url` at `width` px wide. Non-Supabase URLs pass through. */
export function optimizedUrl(url: string, width: number): string {
  if (!isSupabasePhoto(url)) return url;
  return `/_next/image?url=${encodeURIComponent(url)}&w=${width}&q=75`;
}

/** Builds an `srcset` string, or undefined when the URL can't be optimized. */
export function optimizedSrcSet(url: string, widths: number[]): string | undefined {
  if (!isSupabasePhoto(url)) return undefined;
  return widths.map((w) => `${optimizedUrl(url, w)} ${w}w`).join(', ');
}
