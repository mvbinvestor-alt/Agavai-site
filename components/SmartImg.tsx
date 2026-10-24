'use client';

import { useEffect, useRef } from 'react';
import { optimizedSrcSet, optimizedUrl } from '@/lib/imageUrl';

/**
 * A plain <img> that asks for a small, cached copy of the photo instead of the full-size original.
 * If the resized copy ever fails to load, it quietly falls back to the original so a photo is
 * never left blank. Keeps the same markup as before, so all existing styling still applies.
 */
export default function SmartImg({
  src,
  alt,
  widths,
  sizes,
  loading,
  priority = false,
}: {
  src: string;
  alt: string;
  /** Widths (px) to offer the browser, smallest first. Must be allowed in next.config.js. */
  widths: number[];
  /** Hint for how wide the image is displayed, e.g. "(max-width: 600px) 50vw, 360px". */
  sizes?: string;
  loading?: 'lazy' | 'eager';
  priority?: boolean;
}) {
  const ref = useRef<HTMLImageElement>(null);

  function fallback() {
    const el = ref.current;
    if (!el || el.dataset.fallback === '1') return;
    el.dataset.fallback = '1';
    el.removeAttribute('srcset');
    el.src = src;
  }

  // The resized copy may fail before React has attached onError (server-rendered page).
  useEffect(() => {
    const el = ref.current;
    if (el && el.complete && el.naturalWidth === 0 && el.currentSrc) fallback();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const mid = widths[Math.min(1, widths.length - 1)];

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      ref={ref}
      src={optimizedUrl(src, mid)}
      srcSet={optimizedSrcSet(src, widths)}
      sizes={sizes}
      alt={alt}
      loading={priority ? 'eager' : loading}
      decoding="async"
      onError={fallback}
    />
  );
}
