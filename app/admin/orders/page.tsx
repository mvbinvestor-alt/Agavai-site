import Link from 'next/link';
import { isAdminAuthed } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import AdminLogin from '@/components/AdminLogin';
import OrderRow from '@/components/OrderRow';
import type { Order } from '@/lib/types';

export const revalidate = 0;

async function getOrders(): Promise<Order[]> {
  const admin = supabaseAdmin();
  const { data: orders } = await admin
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(200);
  if (!orders || orders.length === 0) return [];

  const { data: items } = await admin
    .from('order_items')
    .select('*')
    .in(
      'order_id',
      orders.map((o) => o.id)
    );

  return orders.map((o) => ({ ...o, items: (items || []).filter((i) => i.order_id === o.id) }));
}

export default async function AdminOrdersPage() {
  if (!(await isAdminAuthed())) {
    return <AdminLogin />;
  }

  const orders = await getOrders();
  const revenueStatuses = ['paid', 'packed', 'shipped', 'delivered'];
  const revenueOrders = orders.filter((o) => revenueStatuses.includes(o.status));
  const paidTotal = revenueOrders.reduce((sum, o) => sum + (o.total || o.price || 0), 0);
  const needsAction = orders.filter((o) => ['paid', 'packed', 'shipped'].includes(o.status)).length;

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
        Total revenue: <strong>₹{paidTotal.toLocaleString('en-IN')}</strong>
        {needsAction > 0 && (
          <>
            {' · '}
            <strong style={{ color: 'var(--clay)' }}>
              {needsAction} order{needsAction > 1 ? 's' : ''} need next step
            </strong>
          </>
        )}
      </p>

      {orders.length === 0 ? (
        <div className="empty-state">No orders yet.</div>
      ) : (
        <div>
          {orders.map((o) => (
            <OrderRow key={o.id} order={o} />
          ))}
        </div>
      )}
    </div>
  );
}
