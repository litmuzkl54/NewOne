import './Hero.css';

export default function Hero() {
  return (
    <section className="hero">
      <div className="hero-inner">
        <h1 className="hero-title">
          Partner with <span className="highlight">TPA LLC</span> for Your Business Success
        </h1>
        <p className="hero-subtitle">
          We deliver strategic consulting and technology solutions that drive
          measurable results. Schedule a free 30-minute consultation to discuss
          how we can help your organization grow.
        </p>
        <a href="#book" className="hero-cta">
          Book a Meeting
        </a>
      </div>
    </section>
  );
}
