import Link from 'next/link';

export default function Header() {
  return (
    <header className="site-header">
      <div className="wrap site-header__row">
        <Link href="/" className="wordmark">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.jpg" alt="Agavai — Artistry for the Ages" className="wordmark__logo" />
        </Link>
        <nav className="nav-links">
          <Link href="/#collection">Collection</Link>
          <a href="https://www.instagram.com/agavai.in" target="_blank" rel="noopener noreferrer">
            Instagram
          </a>
        </nav>
      </div>
    </header>
  );
}
