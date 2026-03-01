import { 
  LayoutDashboard, 
  KeyRound, 
  BarChart3, 
  Shield, 
  Settings, 
  LogOut,
  ChevronRight,
  HelpCircle,
  Users
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useState } from "react";
import "./Sidebar.css";

function Sidebar({ isMobileOpen }) {
  const location = useLocation();
  const [hoveredItem, setHoveredItem] = useState(null);

  const menuItems = [
    { 
      icon: LayoutDashboard, 
      label: "Dashboard", 
      path: "/dashboard",
      badge: null
    },
    { 
      icon: KeyRound, 
      label: "API Keys", 
      path: "/keys",
      badge: "12"
    },
    { 
      icon: BarChart3, 
      label: "Analytics", 
      path: "/analytics",
      badge: null
    },
    { 
      icon: Shield, 
      label: "Rate Limits", 
      path: "/limits",
      badge: "3"
    },
    { 
      icon: Users, 
      label: "Team", 
      path: "/team",
      badge: null
    },
    { 
      icon: Settings, 
      label: "Settings", 
      path: "/settings",
      badge: null
    },
  ];

  return (
    <aside className={`sidebar ${isMobileOpen ? "open" : ""}`}>
      {/* Brand Section */}
      <div className="sidebar-brand">
        <div className="brand-logo">
          <Shield size={28} className="logo-icon" />
        </div>
        <div className="brand-info">
          <h2>RateLimiter</h2>
          <span>Enterprise Edition</span>
        </div>
      </div>

      {/* User Profile */}
      <div className="user-profile">
        <div className="user-avatar">
          <span>JD</span>
          <div className="status-dot"></div>
        </div>
        <div className="user-details">
          <h4>John Doe</h4>
          <p>Administrator</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          const isHovered = hoveredItem === item.path;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`nav-item ${isActive ? "active" : ""}`}
              onMouseEnter={() => setHoveredItem(item.path)}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <div className="nav-content">
                <div className={`nav-icon ${isActive ? "active" : ""}`}>
                  <Icon size={20} />
                </div>
                <span className="nav-label">{item.label}</span>
              </div>
              
              <div className="nav-right">
                {item.badge && (
                  <span className="nav-badge">{item.badge}</span>
                )}
                {(isActive || isHovered) && (
                  <ChevronRight size={16} className="nav-chevron" />
                )}
              </div>

              {isActive && <div className="active-indicator" />}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <NavLink to="/help" className="nav-item help-item">
          <HelpCircle size={20} />
          <span>Help & Support</span>
        </NavLink>

        <button className="logout-btn">
          <LogOut size={20} />
          <span>Logout</span>
        </button>

        <div className="version-info">
          <p>Version 2.0.0</p>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="sidebar-glow"></div>
    </aside>
  );
}

export default Sidebar;