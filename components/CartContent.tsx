'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import type { CartItem } from '@/context/CartContext';
import { WHATSAPP_NUMBER } from '@/lib/whatsapp';
import { instagramDmLink } from '@/lib/instagram';

export default function CartContent() {
  const { items, removeItem, updateQuantity, subtotal } = useCart();
  // product_id of the item whose "you've hit the stock limit" note is showing.
  const [limitNotice, setLimitNotice] = useState<string | null>(null);

  function handleIncrease(item: CartItem) {
    if (item.quantity >= item.maxQuantity) {
      setLimitNotice(item.product_id);
      setTimeout(() => setLimitNotice((cur) => (cur === item.product_id ? null : cur)), 2500);
      return;
    }
    setLimitNotice(null);
    updateQuantity(item.product_id, item.quantity + 1);
  }

  function handleDecrease(item: CartItem) {
    setLimitNotice(null);
    updateQuantity(item.product_id, item.quantity - 1);
  }

  return (
    <div className="wrap" style={{ padding: '40px 20px', maxWidth: 720 }}>
      <h1 className="font-display" style={{ fontSize: 28, marginBottom: 20 }}>
        Your Cart
      </h1>

      {items.length === 0 ? (
        <div className="empty-state">
          Your cart is empty.{' '}
          <Link href="/#collection" className="btn btn-outline" style={{ marginTop: 12 }}>
            Browse the collection
          </Link>
        </div>
      ) : (
        <>
          <div>
            {items.map((item) => (
              <div key={item.product_id}>
                <div className="cart-row">
                  <div className="cart-row__img">
                    {item.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.image} alt={item.name} />
                    ) : (
                      <div className="cart-row__noimg" />
                    )}
                  </div>
                  <div className="cart-row__info">
                    <strong>{item.name}</strong>
                    <span>₹{item.price.toLocaleString('en-IN')} each</span>
                  </div>
                  <div className="cart-row__qty">
                    <button type="button" onClick={() => handleDecrease(item)} aria-label="Decrease quantity">
                      −
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => handleIncrease(item)}
                      aria-label="Increase quantity"
                      style={item.quantity >= item.maxQuantity ? { opacity: 0.4 } : undefined}
                    >
                      +
                    </button>
                  </div>
                  <div className="cart-row__total">
                    ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                  </div>
                  <button
                    type="button"
                    className="cart-row__remove"
                    onClick={() => removeItem(item.product_id)}
                    aria-label={`Remove ${item.name}`}
                  >
                    ✕
                  </button>
                </div>
                {limitNotice === item.product_id && (
                  <p className="cart-row__limit-note">
                    Only {item.maxQuantity} in stock — that&apos;s the most you can add right now.
                  </p>
                )}
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <span>Subtotal</span>
            <strong>₹{subtotal.toLocaleString('en-IN')}</strong>
          </div>
          <p style={{ fontSize: 13, color: 'var(--ink-soft)' }}>Shipping calculated at checkout.</p>
          <p style={{ fontSize: 13, color: 'var(--ink-soft)' }}>
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

          <Link href="/checkout" className="btn" style={{ marginTop: 12, display: 'inline-block' }}>
            Proceed to Checkout
          </Link>
        </>
      )}
    </div>
  );
}
