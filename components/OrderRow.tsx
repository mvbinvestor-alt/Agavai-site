'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Order } from '@/lib/types';

const STATUS_COLOR: Record<string, string> = {
  paid: '#3f5c3f',
  packed: 'var(--brass)',
  shipped: '#2f5f8f',
  delivered: '#3f5c3f',
  pending: 'var(--brass)',
  failed: 'var(--clay)',
  cancelled: 'var(--ink-soft)',
  expired: 'var(--ink-soft)',
  returned: 'var(--clay)',
};

const NEXT_STEP: Record<string, { label: string; status: string } | undefined> = {
  paid: { label: 'Mark Packed', status: 'packed' },
  packed: { label: 'Mark Shipped', status: 'shipped' },
  shipped: { label: 'Mark Delivered', status: 'delivered' },
};

export default function OrderRow({ order }: { order: Order }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [showTracking, setShowTracking] = useState(false);
  const [tracking, setTracking] = useState('');

  const nextStep = NEXT_STEP[order.status];

  async function advance(status: string, extra: Record<string, string> = {}) {
    setSaving(true);
    await fetch(`/api/admin/orders/${order.id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, ...extra }),
    });
    setSaving(false);
    setShowTracking(false);
    router.refresh();
  }

  function handleNextClick() {
    if (!nextStep) return;
    if (nextStep.status === 'shipped') {
      setShowTracking(true);
      return;
    }
    advance(nextStep.status);
  }

  const items = order.items || [];
  const itemSummary =
    items.length > 0
      ? items.map((i) => `${i.product_name} ×${i.quantity}`).join(', ')
      : order.product_name;

  return (
    <div className="admin-row" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div className="admin-row__info">
          <strong>{itemSummary}</strong>
          <span>
            {order.total != null ? `₹${Number(order.total).toLocaleString('en-IN')} · ` : ''}
            {new Date(order.created_at).toLocaleString('en-IN')}
            {order.shipping_phone ? ` · ${order.shipping_phone}` : ''}
          </span>
          {order.shipping_city && (
            <span>
              {order.shipping_address_line1}, {order.shipping_city}, {order.shipping_state} —{' '}
              {order.shipping_pincode}
            </span>
          )}
          {order.tracking_number && <span>Tracking: {order.tracking_number}</span>}
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
          {nextStep && (
            <button onClick={handleNextClick} disabled={saving}>
              {saving ? '…' : nextStep.label}
            </button>
          )}
        </div>
      </div>

      {showTracking && (
        <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
          <input
            placeholder="Tracking number (optional)"
            value={tracking}
            onChange={(e) => setTracking(e.target.value)}
            style={{ flex: 1, minWidth: 160 }}
          />
          <button onClick={() => advance('shipped', { tracking_number: tracking })} disabled={saving}>
            {saving ? '…' : 'Confirm Shipped'}
          </button>
        </div>
      )}
    </div>
  );
}
