import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CatalogGrid from '@/components/CatalogGrid';
import PokkishamStrip from '@/components/PokkishamStrip';
import WhatsAppButton from '@/components/WhatsAppButton';
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

  return (
    <>
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
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <a href="#collection" className="btn">
              Browse the collection
            </a>
            <WhatsAppButton label="Chat on WhatsApp" />
          </div>
        </div>
      </section>

      <PokkishamStrip products={products} />
      <CatalogGrid products={products} />
      <Footer />
    </>
  );
}
