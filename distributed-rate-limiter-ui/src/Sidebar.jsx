import { 
  LayoutDashboard, 
  BarChart3, 
  Shield, 
  LogOut
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { apiUrl } from "./apiBase";
import "./Sidebar.css";

function Sidebar({ isMobileOpen }) {
  const navigate = useNavigate();

  const menuItems = [
    { 
      icon: LayoutDashboard, 
      label: "Dashboard", 
      path: "/dashboard"
    },
    { 
      icon: BarChart3, 
      label: "Analytics", 
      path: "/analytics"
    },
  ];

  const handleLogout = async () => {
    try {
      await fetch(apiUrl("/api/auth/logout"), {
        method: "POST",
        credentials: "include",
      });
    } catch {
      // Ignore API errors and clear client session anyway.
    } finally {
      localStorage.removeItem("adminUser");
      navigate("/login", { replace: true });
    }
  };

  return (
    <aside className={`sidebar ${isMobileOpen ? "open" : ""}`}>
      <div className="sidebar-brand">
        <div className="brand-logo">
          <Shield size={28} className="logo-icon" />
        </div>
        <div className="brand-info">
          <h2>RateLimiter</h2>
          <span>Control Panel</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
            >
              <div className="nav-content">
                <div className="nav-icon">
                  <Icon size={20} />
                </div>
                <span className="nav-label">{item.label}</span>
              </div>
            </NavLink>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <button className="logout-btn" onClick={handleLogout}>
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
