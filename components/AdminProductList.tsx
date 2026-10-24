'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Product } from '@/lib/types';
import { isOnSale, getEffectivePrice } from '@/lib/pricing';
import SmartImg from './SmartImg';
import { IMG_WIDTHS } from '@/lib/imageUrl';

export default function AdminProductList({
  products,
  globalDiscountPercent = null,
}: {
  products: Product[];
  globalDiscountPercent?: number | null;
}) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete "${name}"? This can't be undone.`)) return;
    setDeletingId(id);
    await fetch(`/api/products/${id}`, { method: 'DELETE' });
    setDeletingId(null);
    router.refresh();
  }

  if (products.length === 0) {
    return (
      <div className="empty-state">No products yet — add your first piece.</div>
    );
  }

  return (
    <div>
      {products.map((p) => (
        <div className="admin-row" key={p.id}>
          <div className="admin-row__thumb">
            {(() => {
              const cover = p.media.find((m) => m.type === 'image') ?? p.media[0];
              if (!cover) return null;
              return cover.type === 'video' ? (
                <span className="pd-gallery__videothumb" aria-label="Video">▶</span>
              ) : (
                <SmartImg src={cover.url} alt="" widths={[IMG_WIDTHS.tiny]} sizes="52px" loading="lazy" />
              );
            })()}
          </div>
          <div className="admin-row__info">
            <strong>{p.name}</strong>
            <span>
              {p.sku ? `${p.sku} · ` : ''}
              {p.category}
              {p.price != null ? ` · ₹${Number(p.price).toLocaleString('en-IN')}` : ''}
              {isOnSale(p, globalDiscountPercent)
                ? ` → ₹${Number(getEffectivePrice(p, globalDiscountPercent)).toLocaleString('en-IN')} (sale)`
                : ''}
              {` · Qty: ${p.quantity}`}
              {!p.is_available ? ' · Sold' : ''}
            </span>
          </div>
          <div className="admin-row__actions">
            <a href={`/admin/edit/${p.id}`}>Edit</a>
            <button onClick={() => handleDelete(p.id, p.name)} disabled={deletingId === p.id}>
              {deletingId === p.id ? 'Deleting…' : 'Delete'}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
