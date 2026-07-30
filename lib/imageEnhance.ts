import sharp from 'sharp';

/**
 * Baseline enhancement applied to every uploaded photo, for free, with no
 * external API. This fixes the most common "phone photo" problems:
 * - wrong orientation (reads the EXIF rotation tag and bakes it in)
 * - flat/dull exposure (auto white-balance + contrast stretch)
 * - softness from phone compression (a light sharpen pass)
 * - oversized files (resized to a sensible max + recompressed)
 *
 * This does NOT remove backgrounds, relight a scene, or invent detail —
 * see aiEnhance.ts for the optional AI-assisted crop/color pass on top of
 * this.
 */
export async function baselineEnhance(input: Buffer): Promise<Buffer> {
  return sharp(input)
    .rotate() // auto-orient from EXIF, then strip the tag
    .resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true })
    .normalise() // auto contrast/levels stretch
    .modulate({ saturation: 1.05 }) // small lift so colors don't look washed out
    .sharpen({ sigma: 0.6 })
    .jpeg({ quality: 86, mozjpeg: true })
    .toBuffer();
}
