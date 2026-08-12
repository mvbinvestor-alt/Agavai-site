const REASONS = [
  {
    title: 'Real history, honestly told',
    text: 'Every Agavai Pokkisham piece is genuinely pre-owned — we tell you what it is, not just what it looks like.',
  },
  {
    title: 'Made by hand, not a factory',
    text: 'Our decor pieces are handcrafted by artisans, not mass-produced — expect small, honest variations.',
  },
  {
    title: 'Straight to the source',
    text: 'We source directly — from Karaikudi enamelware to Athangudi tile furniture — no middlemen inflating the story or the price.',
  },
  {
    title: 'A real person on the other end',
    text: 'Questions before you buy? Message us on WhatsApp or Instagram — you\u2019ll talk to us, not a chatbot.',
  },
];

export default function WhyChooseAgavai() {
  return (
    <section className="why-strip">
      <div className="wrap">
        <div className="hero__eyebrow">Why Agavai</div>
        <h2 className="font-display why-strip__title">Why people choose us</h2>

        <div className="why-strip__grid">
          {REASONS.map((r) => (
            <div className="why-strip__item" key={r.title}>
              <h3>{r.title}</h3>
              <p>{r.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
