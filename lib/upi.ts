// Direct UPI collection as a fallback when Razorpay isn't set up. There's no
// webhook for personal UPI — payment has to be confirmed manually in
// /admin/orders (see markOrderPaid in lib/orderFulfillment.ts).

export function isUpiConfigured() {
  return !!process.env.UPI_ID;
}

export function getUpiId() {
  return process.env.UPI_ID || '';
}

export function getUpiPayeeName() {
  return process.env.UPI_PAYEE_NAME || 'Agavai';
}

export function buildUpiLink(params: { amount: number; orderId: string; note?: string }) {
  const payeeUpi = process.env.UPI_ID!;
  const payeeName = process.env.UPI_PAYEE_NAME || 'Agavai';
  const q = new URLSearchParams({
    pa: payeeUpi,
    pn: payeeName,
    am: params.amount.toFixed(2),
    cu: 'INR',
    tn: params.note || `Agavai order ${params.orderId.slice(0, 8)}`,
  });
  return `upi://pay?${q.toString()}`;
}
