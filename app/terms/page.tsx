import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata = {
  title: 'Terms & Conditions — Agavai',
  description: 'Terms of use and sale for agavai.in.',
};

export default function TermsPage() {
  return (
    <>
      <Header />
      <section className="hero" style={{ paddingBottom: 20 }}>
        <div className="wrap">
          <div className="hero__eyebrow">Policies</div>
          <h1 style={{ maxWidth: '18ch' }}>Terms &amp; Conditions</h1>
        </div>
      </section>

      <section className="wrap legal-page" style={{ padding: '10px 0 60px', maxWidth: 720 }}>
        <p className="updated">Last updated: [Date]</p>

        <p>
          By using agavai.in or placing an order with us, you agree to the terms below. Please
          read them along with our <a href="/privacy">Privacy Policy</a> and{' '}
          <a href="/shipping-returns">Shipping &amp; Return Policy</a>.
        </p>

        <h2>About Our Products</h2>
        <p>
          Agavai sells two kinds of pieces: freshly handcrafted decor made by artisans, and
          &quot;Agavai Pokkisham&quot; — genuine vintage and antique pieces that are pre-owned and
          sold as-is. Photos are representative; because many pieces are handcrafted or antique,
          slight variations in color, texture, or finish from the photos are normal, not a defect.
        </p>

        <h2>Pricing &amp; Availability</h2>
        <p>
          Prices are listed in Indian Rupees (₹) and may change without notice. Antique/vintage
          pieces are one-of-a-kind — if a piece sells out or becomes unavailable after you&apos;ve
          added it to your cart, we&apos;ll let you know before charging you.
        </p>

        <h2>Orders &amp; Payment</h2>
        <p>
          Orders are confirmed once payment is received. We accept payment via Razorpay and direct
          UPI transfer. UPI payments are confirmed manually by our team, which may take a few
          hours — your order will show as &quot;pending&quot; until then.
        </p>

        <h2>Shipping</h2>
        <p>
          See our full <a href="/shipping-returns">Shipping &amp; Return Policy</a> for shipping
          costs, timelines, and our return/exchange terms.
        </p>

        <h2>Cancellations</h2>
        <p>
          You may request cancellation before your order has been packed by contacting us. Once an
          order has shipped, our standard return policy applies instead.
        </p>

        <h2>Limitation of Liability</h2>
        <p>
          We take care in describing and packing every piece, but antiques by nature carry signs of
          age and use — this is part of their character, not a fault. We are not liable for
          delays caused by couriers or circumstances outside our control.
        </p>

        <h2>Changes to These Terms</h2>
        <p>
          We may update these terms from time to time. Continued use of the site after changes
          means you accept the updated terms.
        </p>

        <h2>Governing Law</h2>
        <p>These terms are governed by the laws of India.</p>

        <h2>Contact</h2>
        <p>
          Questions about these terms? Reach us via the details on our{' '}
          <a href="/contact">Contact page</a>.
        </p>
      </section>
      <Footer />
    </>
  );
}
