import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <p>&copy; {new Date().getFullYear()} TPA LLC. All rights reserved.</p>
      </div>
    </footer>
  );
}
