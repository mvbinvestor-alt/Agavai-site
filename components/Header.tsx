'use client';

import Link from 'next/link';
import { instagramProfileLink } from '@/lib/instagram';
import { useCart } from '@/context/CartContext';

export default function Header() {
  const { count } = useCart();

  return (
    <header className="site-header">
      <div className="wrap site-header__row">
        <Link href="/" className="wordmark">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-header.png" alt="Agavai — Artistry for the Ages" className="wordmark__logo" />
        </Link>
        <nav className="nav-links">
          <Link href="/about">Our Story</Link>
          <Link href="/#collection">Collection</Link>
          <a href={instagramProfileLink()} target="_blank" rel="noopener noreferrer">
            Instagram
          </a>
        </nav>
        <Link href="/cart" className="cart-link">
          🛍️{count > 0 && <span className="cart-badge">{count}</span>}
        </Link>
      </div>
    </header>
  );
}
