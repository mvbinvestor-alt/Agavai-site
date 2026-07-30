import Link from 'next/link';
import type { Product } from '@/lib/types';

export default function ProductCard({ product }: { product: Product }) {
  const cover = product.media[0];

  return (
    <Link href={`/product/${product.id}`} className="product-card">
      <div className="product-card__frame">
        {cover ? (
          cover.type === 'video' ? (
            <video src={cover.url} muted playsInline preload="metadata" />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={cover.url} alt={product.name} loading="lazy" />
          )
        ) : (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              color: 'var(--ink-soft)',
              fontSize: 13,
            }}
          >
            No photo yet
          </div>
        )}
        <span className="product-card__badge">{product.category}</span>
        {!product.is_available && <div className="product-card__sold">Sold</div>}
      </div>
      <div className="product-card__ledge" aria-hidden="true" />
      <div className="product-card__meta">
        <h3 className="product-card__name">{product.name}</h3>
        {product.price != null && (
          <div className="product-card__price">₹{Number(product.price).toLocaleString('en-IN')}</div>
        )}
      </div>
    </Link>
  );
}
