// Optional second enhancement stage. Requires ANTHROPIC_API_KEY to be set
// on the server. If it's missing, or the call fails or times out for any
// reason, this returns null and the upload silently falls back to the
// baseline (sharp-only) enhancement in imageEnhance.ts — uploads never
// fail because of this step.

export interface AiSuggestions {
  crop?: { x: number; y: number; width: number; height: number }; // fractions 0-1
  brightness?: number; // -30..30
  contrast?: number; // -30..30
  saturation?: number; // -30..30
  suggestedName?: string;
  suggestedCategory?: string;
  suggestedMaterial?: string;
}

const MODEL = 'claude-haiku-4-5-20251001';

const PROMPT = `You are helping tidy up product photos for a small Indian home decor & antiques brand called Agavai, for an online catalog.

Look at this photo of a single decor/antique item and respond with ONLY a JSON object (no markdown, no commentary) with these fields:

{
  "crop": { "x": 0.0, "y": 0.0, "width": 1.0, "height": 1.0 },
  "brightness": 0,
  "contrast": 0,
  "saturation": 0,
  "suggestedName": "short product name, e.g. 'Carved Wooden Prayer Arch'",
  "suggestedCategory": "one short category, e.g. 'Wall Art', 'Temple Decor', 'Sculpture', 'Games', 'Furniture'",
  "suggestedMaterial": "short material guess, e.g. 'Hand-carved wood, hand-painted', or empty string if unsure"
}

Rules:
- "crop" is a tight-but-safe bounding box (as fractions of image width/height, 0 to 1) that frames the product with a little breathing room, cropping out excess empty background/floor/wall. If the photo is already well-framed, return x:0, y:0, width:1, height:1.
- "brightness", "contrast", "saturation" are small suggested adjustments from -30 to 30 (0 = no change). Only suggest a nonzero value if the photo is noticeably too dark/flat/dull — most well-lit phone photos need 0 or a very small nudge.
- Only describe what is visibly in the photo. Do not invent history, provenance, or claims you can't see.
- Respond with the JSON object only.`;

export async function getAiSuggestions(jpegBuffer: Buffer): Promise<AiSuggestions | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20_000);

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 400,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: 'image/jpeg',
                  data: jpegBuffer.toString('base64'),
                },
              },
              { type: 'text', text: PROMPT },
            ],
          },
        ],
      }),
      signal: controller.signal,
    });

    if (!res.ok) return null;

    const data = await res.json();
    const text = (data.content || [])
      .filter((b: any) => b.type === 'text')
      .map((b: any) => b.text)
      .join('')
      .trim()
      .replace(/^```json\s*/i, '')
      .replace(/```$/i, '')
      .trim();

    const parsed = JSON.parse(text);

    // Clamp/validate before trusting it.
    const clamp = (n: any, min: number, max: number) =>
      typeof n === 'number' && !Number.isNaN(n) ? Math.max(min, Math.min(max, n)) : 0;

    const suggestions: AiSuggestions = {
      brightness: clamp(parsed.brightness, -30, 30),
      contrast: clamp(parsed.contrast, -30, 30),
      saturation: clamp(parsed.saturation, -30, 30),
      suggestedName: typeof parsed.suggestedName === 'string' ? parsed.suggestedName.slice(0, 80) : undefined,
      suggestedCategory:
        typeof parsed.suggestedCategory === 'string' ? parsed.suggestedCategory.slice(0, 40) : undefined,
      suggestedMaterial:
        typeof parsed.suggestedMaterial === 'string' ? parsed.suggestedMaterial.slice(0, 120) : undefined,
    };

    if (parsed.crop && typeof parsed.crop === 'object') {
      const x = clamp(parsed.crop.x, 0, 0.9);
      const y = clamp(parsed.crop.y, 0, 0.9);
      const width = clamp(parsed.crop.width, 0.1, 1 - x);
      const height = clamp(parsed.crop.height, 0.1, 1 - y);
      if (width > 0.15 && height > 0.15) {
        suggestions.crop = { x, y, width, height };
      }
    }

    return suggestions;
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}
