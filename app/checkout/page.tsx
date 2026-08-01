'use client';

import { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useCart } from '@/context/CartContext';

const SHIPPING_FEE = 0; // flat free shipping for now — easy to change later

export default function CheckoutPage() {
  const { items, subtotal, clear } = useCart();
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    pincode: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function update(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  const total = subtotal + SHIPPING_FEE;
  const canSubmit =
    items.length > 0 &&
    form.name.trim() &&
    form.phone.trim() &&
    form.line1.trim() &&
    form.city.trim() &&
    form.state.trim() &&
    form.pincode.trim();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((i) => ({ product_id: i.product_id, quantity: i.quantity })),
          shipping: {
            name: form.name,
            phone: form.phone,
            email: form.email || null,
            line1: form.line1,
            line2: form.line2 || null,
            city: form.city,
            state: form.state,
            pincode: form.pincode,
          },
        }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || 'Could not start checkout');
      clear();
      window.location.href = body.url;
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try WhatsApp instead.');
      setLoading(false);
    }
  }

  return (
    <>
      <Header />
      <div className="wrap" style={{ padding: '40px 20px', maxWidth: 640 }}>
        <h1 className="font-display" style={{ fontSize: 28, marginBottom: 20 }}>
          Checkout
        </h1>

        {items.length === 0 ? (
          <div className="empty-state">
            Your cart is empty.{' '}
            <Link href="/#collection" className="btn btn-outline" style={{ marginTop: 12 }}>
              Browse the collection
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="checkout-summary">
              {items.map((i) => (
                <div key={i.product_id} className="checkout-summary__row">
                  <span>
                    {i.name} × {i.quantity}
                  </span>
                  <span>₹{(i.price * i.quantity).toLocaleString('en-IN')}</span>
                </div>
              ))}
              <div className="checkout-summary__row checkout-summary__total">
                <span>Total</span>
                <span>₹{total.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <h2 style={{ fontSize: 18, margin: '24px 0 12px' }}>Shipping Address</h2>
            <div className="form-grid">
              <input
                placeholder="Full name"
                value={form.name}
                onChange={(e) => update('name', e.target.value)}
                required
              />
              <input
                placeholder="Phone number"
                value={form.phone}
                onChange={(e) => update('phone', e.target.value)}
                required
              />
              <input
                placeholder="Email (optional)"
                type="email"
                value={form.email}
                onChange={(e) => update('email', e.target.value)}
              />
              <input
                placeholder="Address line 1"
                value={form.line1}
                onChange={(e) => update('line1', e.target.value)}
                required
              />
              <input
                placeholder="Address line 2 (optional)"
                value={form.line2}
                onChange={(e) => update('line2', e.target.value)}
              />
              <input
                placeholder="City"
                value={form.city}
                onChange={(e) => update('city', e.target.value)}
                required
              />
              <input
                placeholder="State"
                value={form.state}
                onChange={(e) => update('state', e.target.value)}
                required
              />
              <input
                placeholder="Pincode"
                value={form.pincode}
                onChange={(e) => update('pincode', e.target.value)}
                required
              />
            </div>

            {error && <div className="error-text" style={{ marginTop: 12 }}>{error}</div>}

            <button className="btn" type="submit" disabled={!canSubmit || loading} style={{ marginTop: 20 }}>
              {loading ? 'Starting checkout…' : `Pay ₹${total.toLocaleString('en-IN')}`}
            </button>
          </form>
        )}
      </div>
      <Footer />
    </>
  );
}
