'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Product } from '@/lib/types';

export default function AdminProductList({ products }: { products: Product[] }) {
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
            {p.media[0] ? (
              p.media[0].type === 'video' ? (
                <video src={p.media[0].url} muted />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.media[0].url} alt="" />
              )
            ) : null}
          </div>
          <div className="admin-row__info">
            <strong>{p.name}</strong>
            <span>
              {p.sku ? `${p.sku} · ` : ''}
              {p.category}
              {p.price != null ? ` · ₹${Number(p.price).toLocaleString('en-IN')}` : ''}
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
