import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { supabaseAdmin } from '@/lib/supabase';
import { buildUpiLink, isUpiConfigured } from '@/lib/upi';
import { WHATSAPP_NUMBER } from '@/lib/whatsapp';
import type { Order, OrderItem } from '@/lib/types';

export const revalidate = 0;

async function getOrder(id: string): Promise<(Order & { items: OrderItem[] }) | null> {
  const admin = supabaseAdmin();
  const { data: order } = await admin.from('orders').select('*').eq('id', id).single();
  if (!order) return null;
  const { data: items } = await admin.from('order_items').select('*').eq('order_id', id);
  return { ...order, items: items || [] };
}

export default async function OrderStatusPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await getOrder(id);

  return (
    <>
      <Header />
      <div className="wrap" style={{ padding: '60px 20px', maxWidth: 560 }}>
        {!order ? (
          <>
            <h1 className="font-display" style={{ fontSize: 28 }}>
              Order not found
            </h1>
            <p style={{ color: 'var(--ink-soft)' }}>
              We couldn&apos;t find that order. If you completed a payment, please message us on
              WhatsApp with your payment confirmation.
            </p>
          </>
        ) : order.status === 'paid' || ['packed', 'shipped', 'delivered'].includes(order.status) ? (
          <>
            <h1 className="font-display" style={{ fontSize: 28 }}>
              Thank you! Your order is confirmed 🎉
            </h1>
            <div style={{ margin: '16px 0' }}>
              {order.items.map((item) => (
                <div
                  key={item.id}
                  style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}
                >
                  <span>
                    {item.product_name} × {item.quantity}
                  </span>
                  <span>₹{Number(item.price * item.quantity).toLocaleString('en-IN')}</span>
                </div>
              ))}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontWeight: 700,
                  borderTop: '1px solid var(--line)',
                  paddingTop: 8,
                  marginTop: 4,
                }}
              >
                <span>Total</span>
                <span>₹{Number(order.total || 0).toLocaleString('en-IN')}</span>
              </div>
            </div>

            {order.shipping_address_line1 && (
              <p style={{ color: 'var(--ink-soft)', fontSize: 14 }}>
                Shipping to: {order.shipping_address_line1}
                {order.shipping_address_line2 ? `, ${order.shipping_address_line2}` : ''},{' '}
                {order.shipping_city}, {order.shipping_state} — {order.shipping_pincode}
              </p>
            )}

            <p style={{ color: 'var(--ink-soft)' }}>
              Order status: <strong style={{ textTransform: 'capitalize' }}>{order.status}</strong>
              {order.tracking_number && <> · Tracking: {order.tracking_number}</>}
            </p>
            <p style={{ color: 'var(--ink-soft)' }}>
              Your order reference is <code>{order.id.slice(0, 8)}</code>.
            </p>
            <Link href={`/order/${order.id}/invoice`} className="btn btn-outline" style={{ marginRight: 10 }}>
              View / Print Invoice
            </Link>
          </>
        ) : order.status === 'pending' ? (
          <>
            <h1 className="font-display" style={{ fontSize: 28 }}>
              {isUpiConfigured() ? 'Complete your payment' : 'Payment pending'}
            </h1>
            {isUpiConfigured() && order.total != null ? (
              <>
                <p style={{ color: 'var(--ink-soft)' }}>
                  Tap below to pay ₹{Number(order.total).toLocaleString('en-IN')} via GPay, PhonePe, or any
                  UPI app.
                </p>
                <a
                  href={buildUpiLink({ amount: order.total, orderId: order.id })}
                  className="btn"
                  style={{ display: 'inline-block', marginRight: 10 }}
                >
                  Pay ₹{Number(order.total).toLocaleString('en-IN')} via UPI
                </a>
                {WHATSAPP_NUMBER && (
                  <a
                    href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
                      `Hi Agavai! I've paid for order ${order.id.slice(0, 8)} via UPI — here's my screenshot.`
                    )}`}
                    className="btn btn-outline"
                    style={{ display: 'inline-block' }}
                  >
                    Send Screenshot on WhatsApp
                  </a>
                )}
                <p style={{ color: 'var(--ink-soft)', fontSize: 13, marginTop: 12 }}>
                  We confirm UPI payments manually — sending your screenshot on WhatsApp speeds this up.
                  This page will update to &quot;confirmed&quot; once we do.
                </p>
              </>
            ) : (
              <p style={{ color: 'var(--ink-soft)' }}>
                We haven&apos;t received confirmation of your payment yet. If you completed payment
                just now, this page may just need a refresh in a minute.
              </p>
            )}
          </>
        ) : (
          <>
            <h1 className="font-display" style={{ fontSize: 28 }}>
              Payment {order.status}
            </h1>
            <p style={{ color: 'var(--ink-soft)' }}>
              This order wasn&apos;t completed. No charge was made. Feel free to try again from
              the product page, or message us on WhatsApp for help.
            </p>
          </>
        )}
        <Link href="/" className="btn btn-outline" style={{ marginTop: 20 }}>
          Back to shop
        </Link>
      </div>
      <Footer />
    </>
  );
}
