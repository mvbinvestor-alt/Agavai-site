import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { supabaseAdmin } from '@/lib/supabase';

export const revalidate = 0;

async function getOrder(id: string) {
  const admin = supabaseAdmin();
  const { data } = await admin.from('orders').select('*').eq('id', id).single();
  return data;
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
        ) : order.status === 'paid' ? (
          <>
            <h1 className="font-display" style={{ fontSize: 28 }}>
              Thank you! Your order is confirmed 🎉
            </h1>
            <p style={{ color: 'var(--ink-soft)' }}>
              <strong>{order.product_name}</strong>
              {order.price != null && ` — ₹${Number(order.price).toLocaleString('en-IN')}`}
            </p>
            <p style={{ color: 'var(--ink-soft)' }}>
              We&apos;ll be in touch on WhatsApp shortly to arrange delivery. Your order reference
              is <code>{order.id.slice(0, 8)}</code>.
            </p>
          </>
        ) : order.status === 'pending' ? (
          <>
            <h1 className="font-display" style={{ fontSize: 28 }}>
              Payment pending
            </h1>
            <p style={{ color: 'var(--ink-soft)' }}>
              We haven&apos;t received confirmation of your payment yet. If you completed payment
              just now, this page may just need a refresh in a minute.
            </p>
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
