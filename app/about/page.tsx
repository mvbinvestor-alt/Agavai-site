import Header from '@/components/Header';
import Footer from '@/components/Footer';
import WhatsAppButton from '@/components/WhatsAppButton';

export const metadata = {
  title: 'Our Story — Agavai',
  description:
    'Agavai is a lifestyle brand founded by four childhood friends, bringing handcrafted antiques and heritage decor into modern homes — where age is art.',
};

export default function AboutPage() {
  return (
    <>
      <Header />

      <section className="hero" style={{ paddingBottom: 20 }}>
        <div className="wrap">
          <div className="hero__eyebrow">Our Story</div>
          <h1 style={{ maxWidth: '18ch' }}>Some creations aren&apos;t just made — they&apos;re crafted.</h1>
        </div>
      </section>

      <section className="wrap" style={{ padding: '10px 0 50px', maxWidth: 720 }}>
        <p className="about-lede">
          Made to last. To be cherished across seasons and passed through generations.
        </p>
        <p className="about-lede">
          This is more than a lifestyle — it&apos;s a quiet celebration of home, earth, and the
          kind of craftsmanship that never goes out of style.
        </p>
        <p className="about-lede">
          Inspired by nature, rooted in tradition. Each piece is thoughtfully chosen to age with
          grace, carrying stories from the past into the future.
        </p>
        <p className="about-lede">
          A tribute to sustainability. To artistry. To the warmth of a well-crafted home.
        </p>

        <div className="about-divider" />

        <h2 className="font-display" style={{ fontSize: 30, fontStyle: 'italic' }}>
          A Celebration of Age
        </h2>
        <p className="about-body">
          To us, age isn&apos;t about oldness — it&apos;s about endurance, wisdom, and soul. It&apos;s
          the grace of a timeworn brass bowl, the warmth of wood that&apos;s held a thousand
          memories, and the story behind every handcrafted detail. We believe that what stands
          the test of time holds the deepest meaning, timeless beauty, and lasting purpose in your
          living space. Because a home shouldn&apos;t just be filled — it should be lived in,
          loved, and remembered.
        </p>
        <p className="about-body">
          Celebrate with us, for the life you build over time — where age is art. We&apos;ve aged
          this idea with love, and it&apos;s finally here. Welcome to Agavai. For the home. For the
          soul.
        </p>

        <div className="about-divider" />

        <h2 className="font-display" style={{ fontSize: 30, fontStyle: 'italic' }}>
          What &ldquo;Agavai&rdquo; Means
        </h2>
        <p className="about-body">
          In Tamil, <em>agavai</em> means age, or the passage of time. It&apos;s where our tagline
          comes from — <strong>Artistry for the Ages</strong> — objects chosen not because they&apos;re
          new, but because they&apos;re built to outlast trend, season, and even us. Every piece we
          sell is picked with that in mind: will this still mean something in twenty years?
        </p>

        <div className="about-divider" />

        <h2 className="font-display" style={{ fontSize: 30, fontStyle: 'italic' }}>
          Four Friends, One Vision
        </h2>
        <p className="about-body">
          Agavai was founded by four childhood friends who met in school and stayed close through
          college and beyond — bound by a shared eye for craft and a home-grown instinct for what
          makes a house feel loved. What began as conversations about wanting to build something
          of their own became Agavai on the first day of the Tamil New Year, 2025.
        </p>
        <p className="about-body">
          They started with home decor — Thanjavur thalayatti dolls, kolu bommai, kamadhenu lamps,
          brass ware, and gifting pieces for weddings and housewarmings. A Kerala mural painting
          was the first piece to really resonate with customers, and it opened the door to
          expanding into heritage cookware and handcrafted furniture. Today, the four friends split
          the work between them — sourcing and delivery handled from their own homes, marketing and
          customer relationships handled just as personally.
        </p>
        <p className="about-body">
          <strong>Agavai Pokkisham</strong> is our vintage treasures collection — each piece
          pre-owned, sourced with care, and personally used and tested in our own homes before it
          earns a place in yours. If the quality isn&apos;t right, it doesn&apos;t make the cut, no
          exceptions.
        </p>
        <p className="about-body">
          Our other decor is freshly handcrafted by skilled artisans and quality-checked before
          it&apos;s ever listed — not vintage, but made to the same standard we&apos;d want in our
          own homes.
        </p>

        <div className="about-divider" />

        <h2 className="font-display" style={{ fontSize: 30, fontStyle: 'italic' }}>
          Signature Collections
        </h2>
        <div className="about-collections">
          <div>
            <h3>Chettinad Enamelware</h3>
            <p>
              Heritage enamel-coated cookware in the style historically used in Chettinad wedding
              trousseaus — sourced from Karaikudi, built to outlast generations. Our idli/dosa
              batter pot is a customer favorite: batter stored in it stays fresh for up to a week.
            </p>
          </div>
          <div>
            <h3>Athangudi Tile Furniture</h3>
            <p>
              Handmade teak tables inlaid with traditional Athangudi tiles — the same tiles found
              set into the floors of old Chettinad homes, reimagined as furniture for yours.
            </p>
          </div>
          <div>
            <h3>Heritage Decor &amp; Antiques</h3>
            <p>
              Kerala mural art, carved wooden sculptures, brass ware, and vintage-inspired pieces
              curated for homes that want character, not clutter.
            </p>
          </div>
        </div>

        <div className="about-divider" />

        <div className="about-press">
          <div className="hero__eyebrow" style={{ marginBottom: 8 }}>
            As Featured In
          </div>
          <p className="about-body" style={{ marginBottom: 0 }}>
            Kungumam Thozhi featured Agavai&apos;s heritage enamelware in their April 2026 issue,
            spotlighting the story behind our Chettinad cookware collection.
          </p>
        </div>

        <p className="about-body" style={{ marginTop: 40, fontStyle: 'italic' }}>
          Agavai is a lifestyle brand that brings the soul of nature into your home — through
          everyday essentials, home utilities, handcrafted decor, and timeless antiques rooted in
          tradition, where earthy rustic charm meets modern living.
        </p>

        <div style={{ marginTop: 30, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <a href="/#collection" className="btn">
            Browse the collection
          </a>
          <WhatsAppButton label="Chat on WhatsApp" />
        </div>
      </section>

      <Footer />
    </>
  );
}
