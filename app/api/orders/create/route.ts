import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { createPaymentLink, isRazorpayConfigured } from '@/lib/razorpay';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  if (!isRazorpayConfigured()) {
    return NextResponse.json(
      { error: 'Payments are not set up yet on this site. Please order via WhatsApp instead.' },
      { status: 503 }
    );
  }

  const { product_id } = await req.json();
  if (!product_id) {
    return NextResponse.json({ error: 'Missing product_id' }, { status: 400 });
  }

  const admin = supabaseAdmin();
  const { data: product, error: productError } = await admin
    .from('products')
    .select('*')
    .eq('id', product_id)
    .single();

  if (productError || !product) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  }
  if (!product.is_available || product.quantity < 1) {
    return NextResponse.json({ error: 'This item is currently sold out.' }, { status: 400 });
  }
  if (product.price == null) {
    return NextResponse.json({ error: 'This item has no price set yet.' }, { status: 400 });
  }

  const { data: order, error: orderError } = await admin
    .from('orders')
    .insert({
      product_id: product.id,
      product_name: product.name,
      price: product.price,
      quantity: 1,
      status: 'pending',
    })
    .select()
    .single();

  if (orderError || !order) {
    return NextResponse.json({ error: 'Could not create order' }, { status: 500 });
  }

  const siteUrl = req.nextUrl.origin;

  try {
    const link = await createPaymentLink({
      orderId: order.id,
      amountInRupees: product.price,
      description: product.name,
      callbackUrl: `${siteUrl}/order/${order.id}`,
    });

    await admin
      .from('orders')
      .update({ razorpay_payment_link_id: link.id })
      .eq('id', order.id);

    return NextResponse.json({ url: link.short_url });
  } catch (err: any) {
    await admin.from('orders').update({ status: 'failed' }).eq('id', order.id);
    return NextResponse.json({ error: err.message || 'Payment link creation failed' }, { status: 500 });
  }
}
