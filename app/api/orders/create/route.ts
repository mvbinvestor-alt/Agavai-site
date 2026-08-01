import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { createPaymentLink, isRazorpayConfigured } from '@/lib/razorpay';
import { isUpiConfigured } from '@/lib/upi';

export const runtime = 'nodejs';

interface CartLine {
  product_id: string;
  quantity: number;
}

interface ShippingInput {
  name: string;
  phone: string;
  email: string | null;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  pincode: string;
}

export async function POST(req: NextRequest) {
  if (!isRazorpayConfigured() && !isUpiConfigured()) {
    return NextResponse.json(
      { error: 'Payments are not set up yet on this site. Please order via WhatsApp instead.' },
      { status: 503 }
    );
  }

  const body = await req.json();
  const items: CartLine[] = body.items || [];
  const shipping: ShippingInput | undefined = body.shipping;

  if (!items.length) {
    return NextResponse.json({ error: 'Your cart is empty' }, { status: 400 });
  }
  if (
    !shipping ||
    !shipping.name ||
    !shipping.phone ||
    !shipping.line1 ||
    !shipping.city ||
    !shipping.state ||
    !shipping.pincode
  ) {
    return NextResponse.json({ error: 'Please fill in your shipping address' }, { status: 400 });
  }

  const admin = supabaseAdmin();

  // Re-fetch products server-side — never trust client-sent prices.
  const productIds = items.map((i) => i.product_id);
  const { data: products, error: productsError } = await admin
    .from('products')
    .select('*')
    .in('id', productIds);

  if (productsError || !products || products.length !== productIds.length) {
    return NextResponse.json({ error: 'One or more items could not be found' }, { status: 404 });
  }

  let subtotal = 0;
  const lineItems: { product_id: string; product_name: string; price: number; quantity: number }[] = [];

  for (const line of items) {
    const product = products.find((p) => p.id === line.product_id);
    if (!product) {
      return NextResponse.json({ error: 'One or more items could not be found' }, { status: 404 });
    }
    if (!product.is_available || product.quantity < line.quantity) {
      return NextResponse.json(
        { error: `"${product.name}" doesn't have enough stock available.` },
        { status: 400 }
      );
    }
    if (product.price == null) {
      return NextResponse.json({ error: `"${product.name}" has no price set yet.` }, { status: 400 });
    }
    subtotal += product.price * line.quantity;
    lineItems.push({
      product_id: product.id,
      product_name: product.name,
      price: product.price,
      quantity: line.quantity,
    });
  }

  const shippingFee = 0; // keep in sync with SHIPPING_FEE on the checkout page
  const total = subtotal + shippingFee;

  const { data: order, error: orderError } = await admin
    .from('orders')
    .insert({
      status: 'pending',
      buyer_name: shipping.name,
      buyer_phone: shipping.phone,
      buyer_email: shipping.email,
      shipping_name: shipping.name,
      shipping_phone: shipping.phone,
      shipping_address_line1: shipping.line1,
      shipping_address_line2: shipping.line2,
      shipping_city: shipping.city,
      shipping_state: shipping.state,
      shipping_pincode: shipping.pincode,
      subtotal,
      shipping_fee: shippingFee,
      total,
    })
    .select()
    .single();

  if (orderError || !order) {
    return NextResponse.json({ error: 'Could not create order' }, { status: 500 });
  }

  const { error: itemsError } = await admin
    .from('order_items')
    .insert(lineItems.map((li) => ({ ...li, order_id: order.id })));

  if (itemsError) {
    return NextResponse.json({ error: 'Could not save order items' }, { status: 500 });
  }

  const siteUrl = req.nextUrl.origin;
  const description =
    lineItems.length === 1 ? lineItems[0].product_name : `${lineItems.length} items from Agavai`;

  if (isRazorpayConfigured()) {
    try {
      const link = await createPaymentLink({
        orderId: order.id,
        amountInRupees: total,
        description,
        callbackUrl: `${siteUrl}/order/${order.id}`,
      });

      await admin.from('orders').update({ razorpay_payment_link_id: link.id }).eq('id', order.id);

      return NextResponse.json({ url: link.short_url });
    } catch (err: any) {
      await admin.from('orders').update({ status: 'failed' }).eq('id', order.id);
      return NextResponse.json({ error: err.message || 'Payment link creation failed' }, { status: 500 });
    }
  }

  // UPI fallback — no gateway, no webhook. Send them to the order page, which
  // shows a "Pay via UPI" button and explains payment is confirmed manually.
  return NextResponse.json({ url: `/order/${order.id}` });
}
