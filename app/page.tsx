import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CatalogGrid from '@/components/CatalogGrid';
import CatalogNotice from '@/components/CatalogNotice';
import PokkishamStrip from '@/components/PokkishamStrip';
import FeaturedProducts from '@/components/FeaturedProducts';
import WhyChooseAgavai from '@/components/WhyChooseAgavai';
import WhatsAppButton from '@/components/WhatsAppButton';
import { instagramProfileLink } from '@/lib/instagram';
import { supabasePublic } from '@/lib/supabase';
import type { Product } from '@/lib/types';

export const revalidate = 0;

async function getProducts(): Promise<Product[]> {
  const { data, error } = await supabasePublic
    .from('products')
    .select('*, media:product_media(*)')
    .eq('is_available', true)
    .order('created_at', { ascending: false });

  if (error || !data) return [];

  return data.map((p: any) => ({
    ...p,
    media: (p.media || []).sort((a: any, b: any) => a.sort_order - b.sort_order),
  }));
}

export default async function HomePage() {
  const products = await getProducts();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Agavai',
    url: 'https://agavai.in',
    logo: 'https://agavai.in/logo-header.png',
    sameAs: [instagramProfileLink()],
    description:
      'Agavai curates vintage treasures (Agavai Pokkisham) and handcrafted heritage decor from Tamil Nadu.',
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header />
      <section className="hero">
        <div className="wrap">
          <div className="hero__eyebrow">Artistry for the Ages</div>
          <h1>A lifestyle brand crafted with soul.</h1>
          <p>
            Agavai curates antiques and handcrafted decor pieces with history in them —
            each one sourced, chosen, and placed on the shelf for a home that isn&apos;t
            like anyone else&apos;s. Browse the collection and order straight on WhatsApp.
          </p>
          <div className="hero__actions" style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <a href="#collection" className="btn">
              Browse the collection
            </a>
            <WhatsAppButton label="Chat on WhatsApp" />
          </div>
        </div>
      </section>

      <FeaturedProducts products={products} />
      <PokkishamStrip products={products} />
      <CatalogNotice />
      <CatalogGrid products={products} />
      <WhyChooseAgavai />
      <Footer />
    </>
  );
}
