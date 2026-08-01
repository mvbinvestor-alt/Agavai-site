import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { sendOrderEmail } from '@/lib/email';

export const runtime = 'nodejs';

function verifySignature(rawBody: string, signature: string | null): boolean {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret || !signature) return false;
  const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
  // timing-safe compare
  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get('x-razorpay-signature');

  if (!verifySignature(rawBody, signature)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const payload = JSON.parse(rawBody);
  const event = payload.event as string;
  const admin = supabaseAdmin();

  // Payment Links events carry the order id in notes.order_id (set when we
  // created the link) and the link id in payment_link.entity.id.
  const linkEntity = payload.payload?.payment_link?.entity;
  const paymentEntity = payload.payload?.payment?.entity;
  const orderId: string | undefined = linkEntity?.notes?.order_id;

  if (!orderId) {
    // Nothing we can match this to — acknowledge so Razorpay doesn't retry forever.
    return NextResponse.json({ ok: true });
  }

  if (event === 'payment_link.paid') {
    const { data: order } = await admin.from('orders').select('*').eq('id', orderId).single();
    if (!order || order.status === 'paid') {
      return NextResponse.json({ ok: true });
    }

    await admin
      .from('orders')
      .update({
        status: 'paid',
        razorpay_payment_id: paymentEntity?.id || null,
        paid_at: new Date().toISOString(),
      })
      .eq('id', orderId);

    const { data: orderItems } = await admin.from('order_items').select('*').eq('order_id', orderId);

    for (const item of orderItems || []) {
      if (!item.product_id) continue;
      const { data: product } = await admin
        .from('products')
        .select('quantity')
        .eq('id', item.product_id)
        .single();

      if (product) {
        const newQty = Math.max(0, product.quantity - item.quantity);
        await admin.from('products').update({ quantity: newQty }).eq('id', item.product_id);
      }
    }

    if (order.buyer_email) {
      sendOrderEmail(order.buyer_email, 'confirmed', { ...order, items: orderItems || [] }).catch(() => {});
    }
  } else if (event === 'payment_link.expired') {
    await admin.from('orders').update({ status: 'expired' }).eq('id', orderId).eq('status', 'pending');
  } else if (event === 'payment_link.cancelled') {
    await admin.from('orders').update({ status: 'cancelled' }).eq('id', orderId).eq('status', 'pending');
  }

  return NextResponse.json({ ok: true });
}
