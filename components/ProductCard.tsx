import Link from 'next/link';
import SmartImg from './SmartImg';
import type { Product } from '@/lib/types';
import { isOnSale, getEffectivePrice } from '@/lib/pricing';
import { IMG_WIDTHS } from '@/lib/imageUrl';

export default function ProductCard({
  product,
  globalDiscountPercent = null,
}: {
  product: Product;
  globalDiscountPercent?: number | null;
}) {
  // Prefer a photo for the card: photos are tiny once resized, videos are heavy to load in a grid.
  const cover = product.media.find((m) => m.type === 'image') ?? product.media[0];
  const isSold = !product.is_available;
  const isOutOfStock = !isSold && product.quantity <= 0;
  const onSale = isOnSale(product, globalDiscountPercent);
  const effectivePrice = getEffectivePrice(product, globalDiscountPercent);

  return (
    <Link href={`/product/${product.id}`} className="product-card">
      <div className="product-card__frame">
        {cover ? (
          cover.type === 'video' ? (
            // Video-only product: don't download the video just to draw a card.
            <div className="product-card__videotile" aria-label={`${product.name} (video)`}>
              <span>▶</span>
              <small>Video</small>
            </div>
          ) : (
            <SmartImg
              src={cover.url}
              alt={product.name}
              widths={[IMG_WIDTHS.card, IMG_WIDTHS.cardLarge]}
              sizes="(max-width: 520px) 50vw, 360px"
              loading="lazy"
            />
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
