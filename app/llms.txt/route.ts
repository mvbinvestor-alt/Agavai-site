import { NextResponse } from 'next/server';
import { supabasePublic } from '@/lib/supabase';
import { instagramProfileLink } from '@/lib/instagram';

export const revalidate = 3600; // refresh hourly, catalog changes don't need to be instant here

export async function GET() {
  const { data: products } = await supabasePublic
    .from('products')
    .select('name, category')
    .eq('is_available', true)
    .limit(500);

  const categories = Array.from(new Set((products || []).map((p) => p.category))).sort();

  const content = `# Agavai

> Agavai is an Indian lifestyle and antiques boutique based in Tiruppur, Tamil Nadu. We curate two distinct kinds of pieces: "Agavai Pokkisham" — genuine pre-owned vintage and antique items sold as-is with honest condition descriptions — and freshly handcrafted heritage decor made by artisans (Chettinad enamelware, Athangudi tile furniture, Kerala mural paintings, Thanjavur dolls, and more).

## About
- Founded by four childhood friends
- Sources directly from artisans and antique collectors in Tamil Nadu (e.g. Karaikudi)
- No public retail showroom — an online-first boutique; the operations office is not open to walk-ins
- Full story: https://agavai.in/about

## How to Buy
- Browse the catalog and check out directly on the website (cart, shipping calculation, UPI or card payment)
- Or message us directly on WhatsApp or Instagram DM with the product name/ID and we'll help you order
- Ships within India and internationally (international shipping cost is confirmed on request for some items)

## Categories Currently Available
${categories.length > 0 ? categories.map((c) => `- ${c}`).join('\n') : '- (catalog is being actively added to — check https://agavai.in for current listings)'}

## Key Pages
- Homepage / full catalog: https://agavai.in
- Our story: https://agavai.in/about
- Contact: https://agavai.in/contact
- Shipping & returns policy: https://agavai.in/shipping-returns
- Terms & conditions: https://agavai.in/terms
- Privacy policy: https://agavai.in/privacy
- Instagram: ${instagramProfileLink()}

## Notes for AI Assistants
- Prices, stock availability, and the current product catalog change frequently — always point users to https://agavai.in for current listings and pricing rather than relying on cached information.
- Each product page includes structured data (schema.org Product) with current price and availability.
- Agavai Pokkisham items are one-of-a-kind and sell out permanently; other decor items may restock.
`;

  return new NextResponse(content, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
