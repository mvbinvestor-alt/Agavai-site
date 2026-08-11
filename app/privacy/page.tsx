import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata = {
  title: 'Privacy Policy — Agavai',
  description: 'How Agavai collects, uses, and protects your information.',
};

export default function PrivacyPage() {
  return (
    <>
      <Header />
      <section className="hero" style={{ paddingBottom: 20 }}>
        <div className="wrap">
          <div className="hero__eyebrow">Policies</div>
          <h1 style={{ maxWidth: '18ch' }}>Privacy Policy</h1>
        </div>
      </section>

      <section className="wrap legal-page" style={{ padding: '10px 0 60px', maxWidth: 720 }}>
        <p className="updated">Last updated: [Date]</p>

        <p>
          This policy explains what information Agavai (&quot;we&quot;, &quot;us&quot;) collects
          when you use agavai.in, and how we use it.
        </p>

        <h2>Information We Collect</h2>
        <p>When you place an order, we collect:</p>
        <ul>
          <li>Your name, phone number, and email address (if provided)</li>
          <li>Your shipping address</li>
          <li>Order details — items purchased, amounts, and payment status</li>
        </ul>
        <p>
          We also collect basic, non-personal analytics — which pages are visited, roughly which
          country a visitor is browsing from, and which site referred you here (e.g. Instagram).
          This does not include your name, IP address in readable form, or any way to personally
          identify you from browsing alone.
        </p>

        <h2>How We Use Your Information</h2>
        <ul>
          <li>To process and deliver your order</li>
          <li>To contact you about your order status (via email or WhatsApp)</li>
          <li>To confirm payment, particularly for UPI payments confirmed manually</li>
          <li>To improve the site based on what people actually browse and buy</li>
        </ul>
        <p>We do not sell your personal information to third parties.</p>

        <h2>Payment Information</h2>
        <p>
          Payments are processed by Razorpay or via direct UPI transfer. We do not store your card,
          UPI, or bank details on our servers — that information is handled directly by the payment
          provider or your banking app.
        </p>

        <h2>Third-Party Services</h2>
        <p>We use the following services, which may process limited data on our behalf:</p>
        <ul>
          <li>Razorpay — payment processing</li>
          <li>Supabase — order and product data storage</li>
          <li>A geolocation lookup service — to show approximate visitor country in our analytics</li>
        </ul>

        <h2>Data Retention</h2>
        <p>
          We keep order records for as long as needed for business, accounting, and legal purposes.
          If you&apos;d like your data removed where we&apos;re not required to keep it, contact us
          and we&apos;ll action that request.
        </p>

        <h2>Your Rights</h2>
        <p>
          You can ask us what information we hold about you, request a correction, or request
          deletion (subject to legal/accounting retention requirements) by contacting us.
        </p>

        <h2>Contact</h2>
        <p>
          Questions about this policy? Reach us via the details on our{' '}
          <a href="/contact">Contact page</a>.
        </p>
      </section>
      <Footer />
    </>
  );
}
