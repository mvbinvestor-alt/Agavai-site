import Link from 'next/link';
import { isAdminAuthed } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import AdminLogin from '@/components/AdminLogin';
import type { Order } from '@/lib/types';

export const revalidate = 0;

async function getOrders(): Promise<Order[]> {
  const admin = supabaseAdmin();
  const { data } = await admin
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(200);
  return data || [];
}

const STATUS_COLOR: Record<string, string> = {
  paid: 'var(--sage)',
  pending: 'var(--brass)',
  failed: 'var(--clay)',
  cancelled: 'var(--ink-soft)',
  expired: 'var(--ink-soft)',
};

export default async function AdminOrdersPage() {
  if (!(await isAdminAuthed())) {
    return <AdminLogin />;
  }

  const orders = await getOrders();
  const paidTotal = orders
    .filter((o) => o.status === 'paid')
    .reduce((sum, o) => sum + (o.price || 0), 0);

  return (
    <div className="admin-shell">
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 20,
        }}
      >
        <h2 style={{ margin: 0 }}>Orders ({orders.length})</h2>
        <Link href="/admin" className="btn btn-outline">
          ← Products
        </Link>
      </div>

      <p style={{ fontSize: 14, color: 'var(--ink-soft)' }}>
        Total paid: <strong>₹{paidTotal.toLocaleString('en-IN')}</strong>
      </p>

      {orders.length === 0 ? (
        <div className="empty-state">No orders yet.</div>
      ) : (
        <div>
          {orders.map((o) => (
            <div className="admin-row" key={o.id}>
              <div className="admin-row__info">
                <strong>{o.product_name}</strong>
                <span>
                  {o.price != null ? `₹${Number(o.price).toLocaleString('en-IN')} · ` : ''}
                  {new Date(o.created_at).toLocaleString('en-IN')}
                  {o.buyer_phone ? ` · ${o.buyer_phone}` : ''}
                </span>
              </div>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: STATUS_COLOR[o.status] || 'var(--ink)',
                  textTransform: 'capitalize',
                }}
              >
                {o.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
