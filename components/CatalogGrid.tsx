'use client';

import { useMemo, useState } from 'react';
import ProductCard from './ProductCard';
import type { Product } from '@/lib/types';

export default function CatalogGrid({ products }: { products: Product[] }) {
  const categories = useMemo(() => {
    const set = new Set(products.map((p) => p.category));
    return ['All', ...Array.from(set)];
  }, [products]);

  const [active, setActive] = useState('All');

  const filtered =
    active === 'All' ? products : products.filter((p) => p.category === active);

  return (
    <section className="shelf-section" id="collection">
      <div className="wrap">
        <div className="chip-row">
          {categories.map((cat) => (
            <button
              key={cat}
              className="chip"
              data-active={active === cat}
              onClick={() => setActive(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="empty-state">
            {products.length === 0
              ? 'The shelves are being arranged — new pieces are coming soon.'
              : 'No pieces in this category yet.'}
          </div>
        ) : (
          <div className="shelf-grid">
            {filtered.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
