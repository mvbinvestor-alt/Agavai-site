'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useCart } from '@/context/CartContext';
import { WHATSAPP_NUMBER } from '@/lib/whatsapp';
import { instagramDmLink } from '@/lib/instagram';

export default function CheckoutPage() {
  const { items, subtotal, clear, removeItem } = useCart();
  const [country, setCountry] = useState('India');
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

  const isInternational = country.trim().toLowerCase() !== 'india';

  function update(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  const unshippableItems = useMemo(
    () => (isInternational ? items.filter((i) => i.shippingInternational == null) : []),
    [items, isInternational]
  );

  const shippingFee = useMemo(() => {
    if (isInternational) {
      return items.reduce((sum, i) => sum + (i.shippingInternational || 0) * i.quantity, 0);
    }
    return items.reduce((sum, i) => sum + i.shippingDomestic * i.quantity, 0);
  }, [items, isInternational]);

  const total = subtotal + shippingFee;
  const PHONE_RE = /^[0-9+\s-]{7,16}$/;
  const fieldsFilled =
    form.name.trim() &&
    PHONE_RE.test(form.phone.trim()) &&
    form.line1.trim() &&
    form.city.trim() &&
    form.state.trim() &&
    form.pincode.trim();
  const blockedByShipping = items.length === 0 || unshippableItems.length > 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!fieldsFilled) {
      setError('Please fill in all the required address fields with valid values (check your phone number format).');
      return;
    }
    if (blockedByShipping) return;
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
            country,
          },
        }),
      });
      const body = await res.json();
      if (!res.ok) {
        if (Array.isArray(body.missingIds) && body.missingIds.length > 0) {
          for (const id of body.missingIds) removeItem(id);
          throw new Error(
            'One or more items in your cart are no longer available — they\u2019ve been removed. Please review your cart and try again.'
          );
        }
        throw new Error(body.error || 'Could not start checkout');
      }
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
            <div className="field">
              <label htmlFor="country">Shipping to</label>
              <select id="country" value={country} onChange={(e) => setCountry(e.target.value)}>
                <option value="India">India</option>
                <option value="International">International (outside India)</option>
              </select>
            </div>

            <p style={{ fontSize: 13, color: 'var(--ink-soft)', marginTop: -8, marginBottom: 16 }}>
              Questions about shipping before you order? Message us on{' '}
              {WHATSAPP_NUMBER && (
                <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer">
                  WhatsApp
                </a>
              )}
              {WHATSAPP_NUMBER && ' or '}
              <a href={instagramDmLink()} target="_blank" rel="noopener noreferrer">
                Instagram DM
              </a>
              .
            </p>

            {unshippableItems.length > 0 && (
              <div style={{ margin: '0 0 16px', padding: '12px 14px', border: '1px solid var(--line)', borderRadius: 6 }}>
                <p style={{ fontSize: 14, marginBottom: 8 }}>
                  International shipping is available for {unshippableItems.map((i) => i.name).join(', ')} —
                  the cost just varies by destination, so we'll need to send you a quote before you can pay.
                </p>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {WHATSAPP_NUMBER && (
                    <a
                      href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
                        `Hi Agavai! I'd like a shipping quote for: ${unshippableItems
                          .map((i) => `${i.name} x${i.quantity}`)
                          .join(', ')} to ${form.city || 'my location'}, ${country}.`
                      )}`}
                      className="btn btn-outline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Get a Quote on WhatsApp
                    </a>
                  )}
                  <a
                    href={instagramDmLink()}
                    className="btn btn-outline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Get a Quote on Instagram
                  </a>
                </div>
              </div>
            )}

            <div className="checkout-summary">
              {items.map((i) => (
                <div key={i.product_id} className="checkout-summary__row">
                  <span>
                    {i.name} × {i.quantity}
                  </span>
                  <span>₹{(i.price * i.quantity).toLocaleString('en-IN')}</span>
                </div>
              ))}
              <div className="checkout-summary__row">
                <span>Shipping ({isInternational ? 'International' : 'India'})</span>
                <span>₹{shippingFee.toLocaleString('en-IN')}</span>
              </div>
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
                type="tel"
                inputMode="tel"
                pattern="[0-9+\s-]{7,16}"
                title="Enter a valid phone number (digits only, 7-16 characters)"
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
                placeholder="State / Province"
                value={form.state}
                onChange={(e) => update('state', e.target.value)}
                required
              />
              <input
                placeholder="Pincode / Postal code"
                value={form.pincode}
                onChange={(e) => update('pincode', e.target.value)}
                required
              />
            </div>

            {error && <div className="error-text" style={{ marginTop: 12 }}>{error}</div>}

            <button
              className="btn"
              type="submit"
              disabled={blockedByShipping || loading}
              style={{ marginTop: 20 }}
            >
              {loading
                ? 'Starting checkout…'
                : unshippableItems.length > 0
                  ? 'Get a shipping quote above to continue'
                  : `Pay ₹${total.toLocaleString('en-IN')}`}
            </button>
          </form>
        )}
      </div>
      <Footer />
    </>
  );
}
