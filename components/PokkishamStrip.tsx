import Link from 'next/link';
import ProductCard from './ProductCard';
import type { Product } from '@/lib/types';

export default function PokkishamStrip({ products }: { products: Product[] }) {
  const pokkisham = products.filter((p) => p.category.trim().toLowerCase() === 'agavai pokkisham');

  if (pokkisham.length === 0) return null;

  return (
    <section className="pokkisham-strip">
      <div className="wrap">
        <div className="pokkisham-strip__head">
          <div>
            <div className="hero__eyebrow">Vintage Treasures</div>
            <h2 className="font-display pokkisham-strip__title">Agavai Pokkisham</h2>
            <p className="pokkisham-strip__desc">
              Pre-owned pieces with a past — sourced with care, personally used and tested in our
              own homes before they earn a place in yours.
            </p>
          </div>
          <Link href="/about" className="btn btn-outline pokkisham-strip__link">
            What makes it different?
          </Link>
        </div>

        <div className="pokkisham-strip__row">
          {pokkisham.map((p) => (
            <div className="pokkisham-strip__item" key={p.id}>
              <ProductCard product={p} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
