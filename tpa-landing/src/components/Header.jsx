import './Header.css';

export default function Header() {
  return (
    <header className="header">
      <div className="header-inner">
        <div className="logo">
          <span className="logo-icon">TPA</span>
          <span className="logo-text">TPA LLC</span>
        </div>
        <nav className="nav">
          <a href="#about">About</a>
          <a href="#book" className="nav-cta">Book a Meeting</a>
        </nav>
      </div>
    </header>
  );
}
