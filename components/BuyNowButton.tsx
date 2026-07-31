'use client';

import { useState } from 'react';

export default function BuyNowButton({ productId }: { productId: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleClick() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: productId }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || 'Could not start checkout');
      window.location.href = body.url;
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try WhatsApp instead.');
      setLoading(false);
    }
  }

  return (
    <div>
      <button className="btn" onClick={handleClick} disabled={loading} style={{ marginRight: 10 }}>
        {loading ? 'Starting checkout…' : 'Buy Now'}
      </button>
      {error && <div className="error-text">{error}</div>}
    </div>
  );
}
