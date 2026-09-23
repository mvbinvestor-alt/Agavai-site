import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { WHATSAPP_NUMBER } from '@/lib/whatsapp';
import { instagramDmLink } from '@/lib/instagram';

export const metadata = {
  title: 'Frequently Asked Questions — Agavai',
  description:
    'Common questions about Agavai Pokkisham antiques, handcrafted decor, shipping, payment, and returns.',
};

const FAQS = [
  {
    q: 'What is "Agavai Pokkisham"?',
    a: 'Agavai Pokkisham is our collection of genuine vintage and antique pieces — pre-owned items with real history, sold as-is. We describe their condition honestly rather than presenting them as new. This is different from our other decor, which is freshly handcrafted by artisans, not used.',
  },
  {
    q: 'Is Agavai decor handmade?',
    a: 'Yes — outside the Agavai Pokkisham antique line, everything is handcrafted by artisans, not mass-produced. Small variations in color, texture, or finish are normal and expected, not defects.',
  },
  {
    q: 'How do I place an order?',
    a: 'You can add items to your cart and check out directly on agavai.in (shipping cost is calculated automatically, and you can pay by card/UPI via Razorpay or direct UPI transfer). Or message us on WhatsApp or Instagram DM with the product name and we\u2019ll help you order that way instead.',
  },
  {
    q: 'Does Agavai ship internationally?',
    a: 'Yes, for many pieces. Where a specific item doesn\u2019t have an international shipping rate set up yet, we ask you to message us for a quote before ordering, since cost depends on the item\u2019s size, weight, and destination.',
  },
  {
    q: 'How is shipping cost calculated?',
    a: 'Shipping is calculated per item based on its size and weight, shown to you before you pay at checkout \u2014 not a flat rate across the whole order.',
  },
  {
    q: 'What payment methods does Agavai accept?',
    a: 'Card and UPI payments via Razorpay, or a direct UPI transfer. UPI transfers are confirmed manually by our team, usually within a few hours \u2014 sending your payment screenshot on WhatsApp speeds this up.',
  },
  {
    q: 'Can I return or exchange an item?',
    a: 'It depends on the item. Agavai Pokkisham antiques are one-of-a-kind and sold as-is given their age, so we\u2019re unable to accept returns except for transit damage. Freshly handcrafted decor can be replaced, repaired, or refunded if it arrives damaged or significantly different from what was shown \u2014 contact us with photos within the window stated in our Shipping & Return Policy.',
  },
  {
    q: 'How do I track my order?',
    a: 'Your order confirmation page shows live status as it moves from packed \u2192 shipped \u2192 delivered, with tracking details once shipped.',
  },
  {
    q: 'Does Agavai have a physical showroom?',
    a: 'No \u2014 Agavai is an online-first boutique based in Tiruppur, Tamil Nadu, without a public showroom. Everything is handled directly over WhatsApp and Instagram, from questions to order support.',
  },
  {
    q: 'Where does Agavai source its pieces from?',
    a: 'Directly from artisans and antique collectors across Tamil Nadu \u2014 for example, Chettinad enamelware and Athangudi tile furniture sourced from the Karaikudi region.',
  },
];

export default function FaqPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQS.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Header />
      <section className="hero" style={{ paddingBottom: 20 }}>
        <div className="wrap">
          <div className="hero__eyebrow">Help</div>
          <h1 style={{ maxWidth: '18ch' }}>Frequently Asked Questions</h1>
        </div>
      </section>

      <section className="wrap legal-page" style={{ padding: '10px 0 60px', maxWidth: 720 }}>
        {FAQS.map((f) => (
          <div key={f.q} style={{ marginBottom: 26 }}>
            <h2 style={{ marginBottom: 6 }}>{f.q}</h2>
            <p style={{ margin: 0 }}>{f.a}</p>
          </div>
        ))}

        <p style={{ marginTop: 30 }}>
          Still have a question?{' '}
          {WHATSAPP_NUMBER && (
            <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer">
              Message us on WhatsApp
            </a>
          )}{' '}
          or{' '}
          <a href={instagramDmLink()} target="_blank" rel="noopener noreferrer">
            Instagram DM
          </a>
          .
        </p>
      </section>
      <Footer />
    </>
  );
}
