import "./Footer.css";

function Footer() {
  const currentYear = new Date().getFullYear();
  const footerLinks = [
    "FAQ",
    "Help Center",
    "Terms of Use",
    "Privacy",
    "Cookie Preferences",
    "Corporate Information",
    "Contact Us",
    "Speed Test",
  ];

  return (
    <footer className="footer">
      <p>
        Questions? <a href="#">Contact us</a>
      </p>

      <div className="footer__links">
        {footerLinks.map((label) => (
          <a key={label} href="#">
            {label}
          </a>
        ))}
      </div>

      <small>Netflix UI Clone . React . Mock Catalog . {currentYear} . Demo</small>
      <div className="footer__note">Non-commercial educational project</div>
    </footer>
  );
}

export default Footer;
