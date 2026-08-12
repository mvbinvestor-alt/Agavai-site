import ProductCard from './ProductCard';
import type { Product } from '@/lib/types';

export default function FeaturedProducts({ products }: { products: Product[] }) {
  const featured = products.filter((p) => p.is_featured);

  if (featured.length === 0) return null;

  return (
    <section className="featured-strip">
      <div className="wrap">
        <div className="hero__eyebrow">Handpicked</div>
        <h2 className="font-display featured-strip__title">Featured Pieces</h2>

        <div className="featured-strip__row">
          {featured.map((p) => (
            <div className="featured-strip__item" key={p.id}>
              <ProductCard product={p} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
