import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import WhatsAppButton from '@/components/WhatsAppButton';
import BuyNowButton from '@/components/BuyNowButton';
import Gallery from '@/components/Gallery';
import { supabasePublic } from '@/lib/supabase';
import type { Product } from '@/lib/types';

export const revalidate = 0;

async function getProduct(id: string): Promise<Product | null> {
  const { data, error } = await supabasePublic
    .from('products')
    .select('*, media:product_media(*)')
    .eq('id', id)
    .single();

  if (error || !data) return null;
  data.media = (data.media || []).sort((a: any, b: any) => a.sort_order - b.sort_order);
  return data as Product;
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) notFound();

  return (
    <>
      <Header />
      <div className="wrap">
        <div className="product-detail">
          <div>
            <Gallery media={product.media} name={product.name} />
          </div>
          <div>
            <div className="pd-cat">{product.category}</div>
            <h1 className="pd-name">{product.name}</h1>
            {product.price != null && (
              <div className="pd-price">₹{Number(product.price).toLocaleString('en-IN')}</div>
            )}

            {product.description && <p className="pd-desc">{product.description}</p>}

            {product.material && (
              <dl className="pd-facts">
                <dt>Material</dt>
                <dd>{product.material}</dd>
              </dl>
            )}

            {product.is_available ? (
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-start' }}>
                <BuyNowButton productId={product.id} />
                <WhatsAppButton productName={product.name} />
              </div>
            ) : (
              <span className="btn btn-outline" style={{ pointerEvents: 'none', opacity: 0.6 }}>
                Sold
              </span>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
