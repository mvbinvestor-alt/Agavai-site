// Order status emails via Resend (resend.com). Optional — if RESEND_API_KEY
// isn't set, these calls are silently skipped so nothing breaks before it's
// configured. To enable: sign up at resend.com, verify a sending domain (or
// use their onboarding@resend.dev for testing), add RESEND_API_KEY and
// RESEND_FROM_EMAIL to your env vars.

import type { Order, OrderItem } from './types';

type EmailKind = 'confirmed' | 'packed' | 'shipped' | 'delivered';

function isConfigured() {
  return !!process.env.RESEND_API_KEY;
}

const SUBJECTS: Record<EmailKind, string> = {
  confirmed: 'Your Agavai order is confirmed',
  packed: 'Your Agavai order has been packed',
  shipped: 'Your Agavai order is on its way',
  delivered: 'Your Agavai order has been delivered',
};

function buildBody(kind: EmailKind, order: Order & { items: OrderItem[] }): string {
  const itemLines = order.items
    .map((i) => `- ${i.product_name} × ${i.quantity} — ₹${Number(i.price * i.quantity).toLocaleString('en-IN')}`)
    .join('\n');

  const intro: Record<EmailKind, string> = {
    confirmed: 'Thank you for your order! Here is what you ordered:',
    packed: 'Your order has been packed and will ship soon.',
    shipped: order.tracking_number
      ? `Your order is on its way. Tracking number: ${order.tracking_number}`
      : 'Your order is on its way.',
    delivered: 'Your order has been delivered. We hope you love it!',
  };

  return [
    intro[kind],
    '',
    itemLines,
    '',
    `Total: ₹${Number(order.total || 0).toLocaleString('en-IN')}`,
    '',
    `Order reference: ${order.id.slice(0, 8)}`,
    '',
    'Questions? Just reply to this email or message us on WhatsApp.',
    '',
    '— Agavai',
  ].join('\n');
}

export async function sendOrderEmail(
  to: string,
  kind: EmailKind,
  order: Order & { items: OrderItem[] }
): Promise<void> {
  if (!isConfigured()) return;

  const from = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: `Agavai <${from}>`,
      to,
      subject: SUBJECTS[kind],
      text: buildBody(kind, order),
    }),
  });
}
