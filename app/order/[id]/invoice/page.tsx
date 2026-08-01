import { supabaseAdmin } from '@/lib/supabase';
import type { Order, OrderItem } from '@/lib/types';
import PrintButton from '@/components/PrintButton';

export const revalidate = 0;

async function getOrder(id: string): Promise<(Order & { items: OrderItem[] }) | null> {
  const admin = supabaseAdmin();
  const { data: order } = await admin.from('orders').select('*').eq('id', id).single();
  if (!order) return null;
  const { data: items } = await admin.from('order_items').select('*').eq('order_id', id);
  return { ...order, items: items || [] };
}

export default async function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await getOrder(id);

  if (!order) {
    return <div className="wrap" style={{ padding: 40 }}>Order not found.</div>;
  }

  return (
    <div className="wrap invoice" style={{ padding: '40px 20px', maxWidth: 640 }}>
      <div className="invoice__header">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo-header.png" alt="Agavai" style={{ height: 48 }} />
        <div style={{ textAlign: 'right' }}>
          <div>
            Invoice #{order.id.slice(0, 8)}
          </div>
          <div>{new Date(order.created_at).toLocaleDateString('en-IN')}</div>
        </div>
      </div>

      <div style={{ margin: '24px 0' }}>
        <strong>Billed to:</strong>
        <div>{order.shipping_name}</div>
        <div>{order.shipping_address_line1}</div>
        {order.shipping_address_line2 && <div>{order.shipping_address_line2}</div>}
        <div>
          {order.shipping_city}, {order.shipping_state} — {order.shipping_pincode}
        </div>
        <div>{order.shipping_phone}</div>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #333', textAlign: 'left' }}>
            <th style={{ padding: '8px 0' }}>Item</th>
            <th style={{ padding: '8px 0', textAlign: 'center' }}>Qty</th>
            <th style={{ padding: '8px 0', textAlign: 'right' }}>Price</th>
            <th style={{ padding: '8px 0', textAlign: 'right' }}>Total</th>
          </tr>
        </thead>
        <tbody>
          {order.items.map((item) => (
            <tr key={item.id} style={{ borderBottom: '1px solid #ccc' }}>
              <td style={{ padding: '8px 0' }}>{item.product_name}</td>
              <td style={{ padding: '8px 0', textAlign: 'center' }}>{item.quantity}</td>
              <td style={{ padding: '8px 0', textAlign: 'right' }}>
                ₹{Number(item.price).toLocaleString('en-IN')}
              </td>
              <td style={{ padding: '8px 0', textAlign: 'right' }}>
                ₹{Number(item.price * item.quantity).toLocaleString('en-IN')}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ marginTop: 16, textAlign: 'right' }}>
        <div>Subtotal: ₹{Number(order.subtotal || 0).toLocaleString('en-IN')}</div>
        <div>Shipping: ₹{Number(order.shipping_fee || 0).toLocaleString('en-IN')}</div>
        <div style={{ fontWeight: 700, fontSize: 18, marginTop: 4 }}>
          Total: ₹{Number(order.total || 0).toLocaleString('en-IN')}
        </div>
      </div>

      <PrintButton />
    </div>
  );
}
