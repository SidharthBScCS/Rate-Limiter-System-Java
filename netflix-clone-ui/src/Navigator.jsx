import "./Navigator.css";
import { useEffect, useRef, useState } from "react";

function Navigator({
  activeNav = "Home",
  onNavClick = () => {},
  currentUser = null,
  onLogout = () => Promise.resolve(),
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const menuRef = useRef(null);
  const navItems = ["Home", "TV Shows", "Movies", "New & Popular", "My List"];
  const userName = currentUser?.name || currentUser?.email || "user_name";
  const avatarUrl = `https://api.dicebear.com/9.x/personas/svg?seed=${encodeURIComponent(userName)}`;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!menuRef.current || menuRef.current.contains(event.target)) {
        return;
      }
      setMenuOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const onScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <header className={`nav ${isScrolled ? "nav--solid" : ""}`}>
      <div className="nav__left">
        <h1 className="nav__logo">NETFLIX</h1>
        <nav className="nav__links">
          {navItems.map((item) => (
            <a
              key={item}
              href="#"
              className={activeNav === item ? "active" : ""}
              onClick={(e) => {
                e.preventDefault();
                onNavClick(item);
              }}
            >
              {item}
            </a>
          ))}
        </nav>
      </div>

      <div className="nav__right">
        <span className="nav__text">Kids</span>
        <button className="nav__icon" aria-label="Search">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M15.5 15.5 21 21m-9.5-2a6.5 6.5 0 1 1 0-13 6.5 6.5 0 0 1 0 13Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <button className="nav__icon" aria-label="Notifications">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M12 22a2.5 2.5 0 0 0 2.45-2h-4.9A2.5 2.5 0 0 0 12 22Zm7-4H5l2-2v-5a5 5 0 1 1 10 0v5l2 2Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <div className="nav__profile-wrap" ref={menuRef}>
          <button
            className="nav__profile"
            aria-label="Open profile menu"
            onClick={() => setMenuOpen((value) => !value)}
          >
            <span className="nav__avatar">
              <img src={avatarUrl} alt={`${userName} profile`} className="nav__avatar-image" />
            </span>
            {menuOpen ? <span className="nav__caret" /> : null}
          </button>
          {menuOpen ? (
            <div className="nav__dropdown">
              <div className="nav__dropdown-user">
                <span className="nav__dropdown-avatar">
                  <img src={avatarUrl} alt={`${userName} profile`} className="nav__avatar-image" />
                </span>
                <span className="nav__dropdown-name">{userName}</span>
              </div>
              <button
                type="button"
                className="nav__dropdown-logout"
                onClick={() => {
                  setMenuOpen(false);
                  onLogout();
                }}
              >
                Logout
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}

export default Navigator;
