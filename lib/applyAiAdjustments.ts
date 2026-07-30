import sharp from 'sharp';
import type { AiSuggestions } from './aiEnhance';

export async function applyAiAdjustments(input: Buffer, suggestions: AiSuggestions): Promise<Buffer> {
  let img = sharp(input);
  const meta = await img.metadata();

  if (suggestions.crop && meta.width && meta.height) {
    const { x, y, width, height } = suggestions.crop;
    img = img.extract({
      left: Math.round(x * meta.width),
      top: Math.round(y * meta.height),
      width: Math.round(width * meta.width),
      height: Math.round(height * meta.height),
    });
  }

  const brightness = 1 + (suggestions.brightness || 0) / 100;
  const saturation = 1 + (suggestions.saturation || 0) / 100;
  if (brightness !== 1 || saturation !== 1) {
    img = img.modulate({ brightness, saturation });
  }

  const contrast = suggestions.contrast || 0;
  if (contrast !== 0) {
    // linear(a, b): output = a * input + b. a>1 increases contrast around mid-grey.
    const a = 1 + contrast / 100;
    const b = -(128 * (a - 1));
    img = img.linear(a, b);
  }

  return img.jpeg({ quality: 86, mozjpeg: true }).toBuffer();
}
