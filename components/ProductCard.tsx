import Link from 'next/link';
import type { Product } from '@/lib/types';
import { isOnSale, getEffectivePrice } from '@/lib/pricing';

export default function ProductCard({ product }: { product: Product }) {
  const cover = product.media[0];
  const isSold = !product.is_available;
  const isOutOfStock = !isSold && product.quantity <= 0;
  const onSale = isOnSale(product);
  const effectivePrice = getEffectivePrice(product);

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
        {onSale && !isSold && <span className="sale-badge sale-badge--card">Sale</span>}
        {isSold && <div className="product-card__sold">Sold</div>}
        {isOutOfStock && (
          <div className="product-card__sold">
            Out of Stock
            {product.restock_message && (
              <span className="product-card__restock">{product.restock_message}</span>
            )}
          </div>
        )}
      </div>
      <div className="product-card__ledge" aria-hidden="true" />
      <div className="product-card__meta">
        <h3 className="product-card__name">{product.name}</h3>
        {product.sku && <div className="product-card__sku">ID: {product.sku}</div>}
        {effectivePrice != null && (
          <div className="product-card__price">
            {onSale && (
              <span className="price-original">₹{Number(product.price).toLocaleString('en-IN')}</span>
            )}
            <span className={onSale ? 'price-sale' : undefined}>
              ₹{Number(effectivePrice).toLocaleString('en-IN')}
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}
