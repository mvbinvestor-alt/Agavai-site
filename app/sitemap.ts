import type { MetadataRoute } from 'next';
import { supabasePublic } from '@/lib/supabase';

const SITE_URL = 'https://agavai.in';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${SITE_URL}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/faq`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE_URL}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE_URL}/shipping-returns`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
    { url: `${SITE_URL}/terms`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${SITE_URL}/privacy`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
  ];

  const { data: products } = await supabasePublic
    .from('products')
    .select('id, created_at')
    .eq('is_available', true);

  const productPages: MetadataRoute.Sitemap = (products || []).map((p) => ({
    url: `${SITE_URL}/product/${p.id}`,
    lastModified: p.created_at ? new Date(p.created_at) : new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  return [...staticPages, ...productPages];
}
