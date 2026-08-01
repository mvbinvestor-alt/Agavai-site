import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthed } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import { sendOrderEmail } from '@/lib/email';
import { markOrderPaid } from '@/lib/orderFulfillment';

export const runtime = 'nodejs';

const TIMESTAMP_FIELD: Record<string, string> = {
  packed: 'packed_at',
  shipped: 'shipped_at',
  delivered: 'delivered_at',
};

const ALLOWED_NEXT: Record<string, string[]> = {
  pending: ['paid', 'cancelled'],
  paid: ['packed', 'cancelled'],
  packed: ['shipped', 'cancelled'],
  shipped: ['delivered', 'returned'],
  delivered: ['returned'],
};

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthed())) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
  }

  const { id } = await params;
  const { status, tracking_number, tracking_url } = await req.json();

  const admin = supabaseAdmin();
  const { data: order } = await admin.from('orders').select('*').eq('id', id).single();
  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }

  const allowed = ALLOWED_NEXT[order.status] || [];
  if (!allowed.includes(status)) {
    return NextResponse.json(
      { error: `Can't move an order from "${order.status}" to "${status}"` },
      { status: 400 }
    );
  }

  // "paid" goes through the shared fulfillment path (stock decrement + email)
  // so manual UPI confirmation behaves identically to the Razorpay webhook.
  if (status === 'paid') {
    const result = await markOrderPaid(id, 'manual-upi-confirm');
    if (!result.ok) {
      return NextResponse.json({ error: result.error || 'Could not confirm payment' }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  }

  const update: Record<string, any> = { status };
  const tsField = TIMESTAMP_FIELD[status];
  if (tsField) update[tsField] = new Date().toISOString();
  if (status === 'shipped') {
    if (tracking_number) update.tracking_number = tracking_number;
    if (tracking_url) update.tracking_url = tracking_url;
  }

  const { error } = await admin.from('orders').update(update).eq('id', id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (order.buyer_email && ['packed', 'shipped', 'delivered'].includes(status)) {
    const { data: items } = await admin.from('order_items').select('*').eq('order_id', id);
    sendOrderEmail(order.buyer_email, status as any, { ...order, ...update, items: items || [] }).catch(() => {});
  }

  return NextResponse.json({ ok: true });
}
