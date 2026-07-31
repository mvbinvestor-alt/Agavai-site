'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Order } from '@/lib/types';

const STATUS_COLOR: Record<string, string> = {
  paid: '#3f5c3f',
  pending: 'var(--brass)',
  failed: 'var(--clay)',
  cancelled: 'var(--ink-soft)',
  expired: 'var(--ink-soft)',
};

export default function OrderRow({ order }: { order: Order }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  async function toggleDispatch() {
    setSaving(true);
    await fetch(`/api/admin/orders/${order.id}/dispatch`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_dispatched: !order.is_dispatched }),
    });
    setSaving(false);
    router.refresh();
  }

  return (
    <div className="admin-row">
      <div className="admin-row__info">
        <strong>{order.product_name}</strong>
        <span>
          {order.price != null ? `₹${Number(order.price).toLocaleString('en-IN')} · ` : ''}
          {new Date(order.created_at).toLocaleString('en-IN')}
          {order.buyer_phone ? ` · ${order.buyer_phone}` : ''}
        </span>
      </div>
      <div className="admin-row__actions" style={{ alignItems: 'center', gap: 10 }}>
        <span
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: STATUS_COLOR[order.status] || 'var(--ink)',
            textTransform: 'capitalize',
          }}
        >
          {order.status}
        </span>
        {order.status === 'paid' &&
          (order.is_dispatched ? (
            <span
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: '#3f5c3f',
                border: '1px solid #3f5c3f',
                borderRadius: 3,
                padding: '4px 8px',
              }}
            >
              ✓ Dispatched
            </span>
          ) : (
            <button onClick={toggleDispatch} disabled={saving}>
              {saving ? '…' : 'Mark dispatched'}
            </button>
          ))}
      </div>
    </div>
  );
}
