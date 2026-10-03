// Email via Resend (resend.com). Optional — if RESEND_API_KEY isn't set,
// order-status emails are silently skipped so nothing breaks before it's
// configured. To enable: sign up at resend.com, verify a sending domain (or
// use their onboarding@resend.dev for testing), add RESEND_API_KEY and
// RESEND_FROM_EMAIL to your env vars.

import type { Order, OrderItem } from './types';

type EmailKind = 'confirmed' | 'packed' | 'shipped' | 'delivered';

function isConfigured() {
  return !!process.env.RESEND_API_KEY;
}

function fromAddress() {
  return process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
}

// Low-level send, shared by order-status emails and the weekly report.
async function sendViaResend({
  to,
  subject,
  text,
  html,
}: {
  to: string | string[];
  subject: string;
  text: string;
  html?: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error('RESEND_API_KEY is not set');

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: `Agavai <${fromAddress()}>`,
      to,
      subject,
      text,
      ...(html ? { html } : {}),
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Resend API error ${res.status}: ${body.slice(0, 300)}`);
  }

  return res.json();
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
  await sendViaResend({ to, subject: SUBJECTS[kind], text: buildBody(kind, order) }).catch(() => {
    // Order emails are a nice-to-have, never block order processing on an email failure.
  });
}

// --- Weekly performance report (admin-only, separate from order emails) ---

export function isReportEmailConfigured() {
  return isConfigured();
}

export function getReportRecipients(): string[] {
  return (process.env.REPORT_RECIPIENTS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

export async function sendReportEmail({
  to,
  subject,
  html,
  text,
}: {
  to: string[];
  subject: string;
  html: string;
  text: string;
}) {
  if (!isConfigured()) throw new Error('Email is not configured (RESEND_API_KEY missing)');
  if (to.length === 0) throw new Error('No recipients configured (REPORT_RECIPIENTS)');
  return sendViaResend({ to, subject, text, html });
}
