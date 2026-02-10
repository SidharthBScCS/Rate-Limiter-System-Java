import "./Navigator.css";

function Navigator({ activeNav = "Home", onNavClick = () => {} }) {
  const navItems = ["Home", "TV Shows", "Movies", "New & Popular", "My List"];

  return (
    <header className="nav">
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
        <a href="#" className="nav__kids">
          Kids
        </a>
        <button className="nav__icon" aria-label="Notifications">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M6.5 9.8c0-3.3 2.2-5.8 5.5-5.8s5.5 2.5 5.5 5.8V14l1.6 2.6c.4.6 0 1.4-.8 1.4H5.7c-.8 0-1.2-.8-.8-1.4L6.5 14V9.8Zm3.8 9.8a1.7 1.7 0 0 0 3.4 0"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <button className="nav__profile" aria-label="Open profile menu">
          <span className="nav__avatar" />
          <span className="nav__caret" />
        </button>
      </div>
    </header>
  );
}

export default Navigator;
