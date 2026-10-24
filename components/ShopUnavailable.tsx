import WhatsAppButton from './WhatsAppButton';
import { instagramDmLink, instagramProfileLink } from '@/lib/instagram';

// Shown instead of an empty shop when the product database can't be reached — so a temporary
// outage reads as "only the website is paused, the business is open", not as if every product
// had vanished. Points people to Instagram, where the products are, and to a personal chat.
export default function ShopUnavailable() {
  return (
    <section className="wrap" style={{ padding: '60px 0 80px', textAlign: 'center' }}>
      <div className="hero__eyebrow">Website taking a short break</div>
      <h2 className="font-display" style={{ fontSize: 32, fontStyle: 'italic', margin: '8px 0 14px' }}>
        Our shelves are being tidied.
      </h2>
      <p style={{ maxWidth: 560, margin: '0 auto 14px', color: 'var(--ink-soft)' }}>
        Only our website is taking a short break — the rest of Agavai is open and running as
        usual. All our products are available on Instagram.
      </p>
      <p style={{ maxWidth: 560, margin: '0 auto 26px', color: 'var(--ink-soft)' }}>
        If you see something you like there, message us and we&apos;ll help you personally with
        details, availability and your order.
      </p>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
        <a href={instagramProfileLink()} target="_blank" rel="noopener noreferrer" className="btn">
          See our products on Instagram
        </a>
        <a href={instagramDmLink()} target="_blank" rel="noopener noreferrer" className="btn btn-outline">
          Message us on Instagram
        </a>
        <WhatsAppButton label="Chat on WhatsApp" />
      </div>
    </section>
  );
}
