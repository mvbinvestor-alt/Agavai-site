import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { WHATSAPP_NUMBER } from '@/lib/whatsapp';

export const metadata = {
  title: 'Shipping & Return Policy — Agavai',
  description: 'Shipping timelines, costs, and our return/exchange policy.',
};

export default function ShippingReturnsPage() {
  return (
    <>
      <Header />
      <section className="hero" style={{ paddingBottom: 20 }}>
        <div className="wrap">
          <div className="hero__eyebrow">Policies</div>
          <h1 style={{ maxWidth: '18ch' }}>Shipping &amp; Returns</h1>
        </div>
      </section>

      <section className="wrap legal-page" style={{ padding: '10px 0 60px', maxWidth: 720 }}>
        <h2>Shipping — Within India</h2>
        <p>
          We ship across India. Shipping cost is calculated per item at checkout, based on the
          size and weight of the piece — you&apos;ll see the exact shipping cost before you pay,
          added to your order total.
        </p>

        <h2>Shipping — International</h2>
        <p>
          International shipping is available for many pieces. Where a piece doesn&apos;t have an
          international rate set up yet, we&apos;ll ask you to message us for a shipping quote
          before your order is placed — this is common for larger or more fragile antiques where
          the cost genuinely depends on destination and courier availability.
        </p>

        <h2>Processing Time</h2>
        <p>
          Once payment is confirmed, orders are typically packed within [X] business days. Each
          piece is handled individually — antiques and handcrafted decor need careful packing, so
          please allow a little extra time compared to mass-produced goods.
        </p>

        <h2>Order Tracking</h2>
        <p>
          You can check your order status anytime on your order confirmation page. We&apos;ll
          update it as your order moves from packed → shipped → delivered, and share tracking
          details once shipped where available.
        </p>

        <h2>Payment Confirmation</h2>
        <p>
          Orders paid via UPI are confirmed manually on our end — this usually happens within a
          few hours. Sending your payment screenshot on WhatsApp after paying helps us confirm
          faster.
        </p>

        <h2>Returns &amp; Exchanges</h2>
        <p>
          Because many of our pieces are one-of-a-kind antiques or individually handcrafted, our
          return policy differs by product type:
        </p>
        <ul>
          <li>
            <strong>Agavai Pokkisham (vintage/antique pieces):</strong> these are sold as-is, given
            their age and history. We describe condition honestly before you buy, but as unique
            used items, we&apos;re unable to accept returns except in cases of damage during
            transit.
          </li>
          <li>
            <strong>Freshly handcrafted decor:</strong> if your item arrives damaged or
            significantly different from what was shown, please contact us within [X] days of
            delivery with photos, and we&apos;ll arrange a replacement, repair, or refund.
          </li>
        </ul>
        <p>
          For any damage claim, please keep the original packaging and message us as soon as
          possible after delivery — this helps us resolve it quickly.
        </p>

        <h2>Questions</h2>
        <p>
          Shipping costs or timelines look off, or your item arrived damaged? Message us on{' '}
          {WHATSAPP_NUMBER ? (
            <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer">
              WhatsApp
            </a>
          ) : (
            'WhatsApp'
          )}{' '}
          and we&apos;ll sort it out.
        </p>
      </section>
      <Footer />
    </>
  );
}
