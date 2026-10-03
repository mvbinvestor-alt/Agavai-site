// Email via Gmail SMTP (your own Gmail account + an "app password" — no
// domain verification or DNS records needed). Optional — if GMAIL_USER /
// GMAIL_APP_PASSWORD aren't set, order-status emails are silently skipped
// so nothing breaks before it's configured. To enable:
// 1. Turn on 2-Step Verification on the Gmail account you want to send from.
// 2. Create an "app password" at https://myaccount.google.com/apppasswords
// 3. Add GMAIL_USER (the full gmail address) and GMAIL_APP_PASSWORD (the
//    16-character app password, no spaces) to your env vars.

import nodemailer from 'nodemailer';
import type { Order, OrderItem } from './types';

type EmailKind = 'confirmed' | 'packed' | 'shipped' | 'delivered';

function isConfigured() {
  return !!process.env.GMAIL_USER && !!process.env.GMAIL_APP_PASSWORD;
}

let cachedTransporter: ReturnType<typeof nodemailer.createTransport> | null = null;

function getTransporter() {
  if (!cachedTransporter) {
    cachedTransporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });
  }
  return cachedTransporter;
}

// Low-level send, shared by order-status emails and the weekly report.
async function sendViaGmail({
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
  if (!isConfigured()) throw new Error('GMAIL_USER / GMAIL_APP_PASSWORD are not set');

  await getTransporter().sendMail({
    from: `Agavai <${process.env.GMAIL_USER}>`,
    to: Array.isArray(to) ? to.join(', ') : to,
    subject,
    text,
    ...(html ? { html } : {}),
  });
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
  await sendViaGmail({ to, subject: SUBJECTS[kind], text: buildBody(kind, order) }).catch(() => {
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
  if (!isConfigured()) throw new Error('Email is not configured (GMAIL_USER / GMAIL_APP_PASSWORD missing)');
  if (to.length === 0) throw new Error('No recipients configured (REPORT_RECIPIENTS)');
  return sendViaGmail({ to, subject, text, html });
}
