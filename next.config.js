// Only photos from OUR Supabase project's public bucket may be resized by the site's image
// optimizer. (Previously any *.supabase.co address was allowed, which would let strangers use
// the site to process other people's images.)
function supabaseHost() {
  try {
    return new URL(process.env.NEXT_PUBLIC_SUPABASE_URL || '').hostname || null;
  } catch {
    return null;
  }
}

const host = supabaseHost();

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      host
        ? {
            protocol: 'https',
            hostname: host,
            pathname: '/storage/v1/object/public/**',
          }
        : {
            protocol: 'https',
            hostname: '*.supabase.co',
            pathname: '/storage/v1/object/public/**',
          },
    ],
    // Only these widths can be requested — keeps the number of stored variants per photo small.
    // Must match IMG_WIDTHS in lib/imageUrl.ts.
    imageSizes: [128, 256, 384],
    deviceSizes: [640, 828, 1200],
    qualities: [75],
    formats: ['image/webp'],
    // Photo filenames are unique and never edited, so keep resized copies for 31 days.
    minimumCacheTTL: 60 * 60 * 24 * 31,
  },
};

module.exports = nextConfig;
