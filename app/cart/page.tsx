'use client';

import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useCart } from '@/context/CartContext';

export default function CartPage() {
  const { items, removeItem, updateQuantity, subtotal } = useCart();

  return (
    <>
      <Header />
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
                <div key={item.product_id} className="cart-row">
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
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                      aria-label="Decrease quantity"
                    >
                      −
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                      disabled={item.quantity >= item.maxQuantity}
                      aria-label="Increase quantity"
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
              ))}
            </div>

            <div className="cart-summary">
              <span>Subtotal</span>
              <strong>₹{subtotal.toLocaleString('en-IN')}</strong>
            </div>
            <p style={{ fontSize: 13, color: 'var(--ink-soft)' }}>Shipping calculated at checkout.</p>

            <Link href="/checkout" className="btn" style={{ marginTop: 12, display: 'inline-block' }}>
              Proceed to Checkout
            </Link>
          </>
        )}
      </div>
      <Footer />
    </>
  );
}
