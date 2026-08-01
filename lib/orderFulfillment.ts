import { supabaseAdmin } from './supabase';
import { sendOrderEmail } from './email';

export async function markOrderPaid(orderId: string, paymentRef?: string): Promise<{ ok: boolean; error?: string }> {
  const admin = supabaseAdmin();
  const { data: order } = await admin.from('orders').select('*').eq('id', orderId).single();
  if (!order) return { ok: false, error: 'Order not found' };
  if (order.status === 'paid' || ['packed', 'shipped', 'delivered'].includes(order.status)) {
    return { ok: true }; // already handled, don't double-decrement stock
  }

  await admin
    .from('orders')
    .update({
      status: 'paid',
      razorpay_payment_id: paymentRef || null,
      paid_at: new Date().toISOString(),
    })
    .eq('id', orderId);

  const { data: orderItems } = await admin.from('order_items').select('*').eq('order_id', orderId);

  for (const item of orderItems || []) {
    if (!item.product_id) continue;
    const { data: product } = await admin.from('products').select('quantity').eq('id', item.product_id).single();
    if (product) {
      const newQty = Math.max(0, product.quantity - item.quantity);
      await admin.from('products').update({ quantity: newQty }).eq('id', item.product_id);
    }
  }

  if (order.buyer_email) {
    sendOrderEmail(order.buyer_email, 'confirmed', { ...order, items: orderItems || [] }).catch(() => {});
  }

  return { ok: true };
}
