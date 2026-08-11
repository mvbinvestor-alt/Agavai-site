import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { instagramDmLink, instagramProfileLink } from '@/lib/instagram';
import { WHATSAPP_NUMBER } from '@/lib/whatsapp';

export const metadata = {
  title: 'Contact Us — Agavai',
  description: 'Get in touch with Agavai via WhatsApp or Instagram.',
};

export default function ContactPage() {
  return (
    <>
      <Header />
      <section className="hero" style={{ paddingBottom: 20 }}>
        <div className="wrap">
          <div className="hero__eyebrow">Get in Touch</div>
          <h1 style={{ maxWidth: '18ch' }}>Contact Us</h1>
        </div>
      </section>

      <section className="wrap legal-page" style={{ padding: '10px 0 60px', maxWidth: 640 }}>
        <p>
          We&apos;re a small team, and the fastest way to reach us is WhatsApp or Instagram —
          that&apos;s where we actually check messages every day.
        </p>

        <h2>WhatsApp</h2>
        <p>
          {WHATSAPP_NUMBER ? (
            <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer">
              Chat with us on WhatsApp
            </a>
          ) : (
            'Available via the WhatsApp button on our product pages.'
          )}
        </p>

        <h2>Instagram</h2>
        <p>
          <a href={instagramProfileLink()} target="_blank" rel="noopener noreferrer">
            @agavai.in
          </a>{' '}
          — browse our full range, or{' '}
          <a href={instagramDmLink()} target="_blank" rel="noopener noreferrer">
            send us a DM
          </a>
          .
        </p>

        <h2>Order Support</h2>
        <p>
          For questions about an existing order, please have your order reference (shown on your
          order confirmation page) ready when you message us — it helps us find your order faster.
        </p>

        <h2>Business Details</h2>
        <p>
          Agavai
          <br />
          [Registered business address — to be added]
          <br />
          [GSTIN, if registered — to be added]
        </p>
      </section>
      <Footer />
    </>
  );
}
