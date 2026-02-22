import "./Footer.css";

function Footer() {
  const currentYear = new Date().getFullYear();
  const footerLinks = [
    "FAQ",
    "Help Center",
    "Account",
    "Media Center",
    "Investor Relations",
    "Jobs",
    "Ways to Watch",
    "Terms of Use",
  ];

  return (
    <footer className="footer">
      <p className="footer__contact">Questions? Contact us.</p>
      <div className="footer__links">
        {footerLinks.map((label) => (
          <a key={label} href="#">
            {label}
          </a>
        ))}
      </div>
      <small>Netflix UI Clone Demo . {currentYear}</small>
    </footer>
  );
}

export default Footer;
