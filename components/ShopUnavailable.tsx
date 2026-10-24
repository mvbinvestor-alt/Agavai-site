import WhatsAppButton from './WhatsAppButton';

// Shown instead of an empty shop when the product database can't be reached — so a temporary
// outage looks like a calm "back shortly" note, not like every product has vanished.
export default function ShopUnavailable() {
  return (
    <section className="wrap" style={{ padding: '60px 0 80px', textAlign: 'center' }}>
      <div className="hero__eyebrow">Back shortly</div>
      <h2 className="font-display" style={{ fontSize: 32, fontStyle: 'italic', margin: '8px 0 14px' }}>
        Our shelves are being tidied.
      </h2>
      <p style={{ maxWidth: 520, margin: '0 auto 24px', color: 'var(--ink-soft)' }}>
        The shop is taking a short break and will be back soon. If you&apos;d like something
        right away, message us and we&apos;ll help you personally.
      </p>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
        <WhatsAppButton label="Chat on WhatsApp" />
      </div>
    </section>
  );
}
