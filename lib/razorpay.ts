// Thin wrapper around Razorpay's Payment Links API. We use hosted Payment
// Links (not the Checkout.js widget) so there's no client-side SDK and no
// card data ever touches our server — the customer is redirected to
// Razorpay's own hosted payment page.
//
// Docs: https://razorpay.com/docs/api/payments/payment-links/

const RAZORPAY_API = 'https://api.razorpay.com/v1';

function isConfigured() {
  return !!(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
}

function authHeader() {
  const id = process.env.RAZORPAY_KEY_ID!;
  const secret = process.env.RAZORPAY_KEY_SECRET!;
  const token = Buffer.from(`${id}:${secret}`).toString('base64');
  return `Basic ${token}`;
}

export interface CreatePaymentLinkParams {
  orderId: string;
  amountInRupees: number;
  description: string;
  callbackUrl: string;
}

export interface PaymentLinkResult {
  id: string;
  short_url: string;
}

export async function createPaymentLink(
  params: CreatePaymentLinkParams
): Promise<PaymentLinkResult> {
  if (!isConfigured()) {
    throw new Error(
      'Payments are not set up yet. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to enable Buy Now.'
    );
  }

  const res = await fetch(`${RAZORPAY_API}/payment_links`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: authHeader(),
    },
    body: JSON.stringify({
      amount: Math.round(params.amountInRupees * 100), // paise
      currency: 'INR',
      description: params.description,
      reference_id: params.orderId,
      callback_url: params.callbackUrl,
      callback_method: 'get',
      notes: { order_id: params.orderId },
    }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.error?.description || 'Could not create payment link.');
  }

  const data = await res.json();
  return { id: data.id, short_url: data.short_url };
}

export { isConfigured as isRazorpayConfigured };
