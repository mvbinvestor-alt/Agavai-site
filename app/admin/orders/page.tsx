import Link from 'next/link';
import { isAdminAuthed } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import AdminLogin from '@/components/AdminLogin';
import OrderRow from '@/components/OrderRow';
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

export default async function AdminOrdersPage() {
  if (!(await isAdminAuthed())) {
    return <AdminLogin />;
  }

  const orders = await getOrders();
  const paidOrders = orders.filter((o) => o.status === 'paid');
  const paidTotal = paidOrders.reduce((sum, o) => sum + (o.price || 0), 0);
  const needsDispatch = paidOrders.filter((o) => !o.is_dispatched).length;

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
        {needsDispatch > 0 && (
          <>
            {' · '}
            <strong style={{ color: 'var(--clay)' }}>
              {needsDispatch} order{needsDispatch > 1 ? 's' : ''} awaiting dispatch
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
