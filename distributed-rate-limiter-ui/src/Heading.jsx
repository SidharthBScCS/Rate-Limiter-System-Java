import { Search, Bell, Calendar, ChevronDown } from "lucide-react";
import { useState } from "react";
import "./Header.css";

function Header() {
  const [date] = useState(new Date().toLocaleDateString('en-US', { 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric' 
  }));

  return (
    <header className="header">
      <div className="header-left">
        <h1 className="page-title">
          Dashboard <span className="page-badge">Overview</span>
        </h1>
      </div>

      <div className="header-right">
        <div className="search-wrapper">
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search anything..." 
            className="search-input"
          />
          <div className="search-shortcut">⌘K</div>
        </div>

        <div className="date-badge">
          <Calendar size={16} />
          <span>{date}</span>
        </div>

        <div className="notification-wrapper">
          <Bell size={20} className="notification-icon" />
          <span className="notification-dot"></span>
        </div>

        <div className="profile-wrapper">
          <div className="profile-avatar">
            <img src="https://ui-avatars.com/api/?name=John+Doe&background=8B5CF6&color=fff" alt="Profile" />
          </div>
          <ChevronDown size={16} className="profile-chevron" />
        </div>
      </div>
    </header>
  );
}

export default Header;