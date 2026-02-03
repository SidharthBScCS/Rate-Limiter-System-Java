import { 
    LayoutGrid, 
    Scale, 
    BarChart3, 
    Settings, 
    LogOut,
    ChevronRight,
    Shield,
    Sparkles
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useState } from "react";
import './Sidebar.css';

function Sidebar() {
    const location = useLocation();
    const [hoverItem, setHoverItem] = useState(null);

    const menuItems = [
        { 
            id: "dashboard", 
            icon: <LayoutGrid size={20} />, 
            label: "Dashboard",
            to: "/"
        },
        { 
            id: "limits", 
            icon: <Scale size={20} />, 
            label: "Rules & Limits",
            to: "/"
        },
        { 
            id: "analytics", 
            icon: <BarChart3 size={20} />, 
            label: "Analytics",
            to: "/analytics"
        },
        { 
            id: "settings", 
            icon: <Settings size={20} />, 
            label: "Settings",
            to: "/"
        },
    ];

    return (
        <div className="sidebar-container">
            {/* Header with Glow Effect */}
            <div className="sidebar-header">
                <div className="logo-container">
                    <Shield size={22} fill="white" />
                    <div className="status-indicator" />
                </div>
                <div>
                    <h5 className="logo-title">RateLimit </h5>
                </div>
            </div>

            {/* User Profile with Gradient */}
            <div className="user-profile">
                <div className="user-avatar">
                    SK
                    <div className="online-indicator">
                        <div className="online-dot" />
                    </div>
                </div>
                
                <div className="user-info">
                    <h6 className="user-name">SIDHARTH KRISHNA</h6>
                    <div className="user-details">
                    </div>
                </div>
            </div>

            {/* Navigation Menu with Hover Effects */}
            <div className="nav-menu">
                {menuItems.map((item) => (
                    <NavLink
                        key={item.id}
                        to={item.to}
                        onMouseEnter={() => setHoverItem(item.id)}
                        onMouseLeave={() => setHoverItem(null)}
                        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                    >
                        <div className="nav-item-content">
                            <div className={`nav-icon ${location.pathname === item.to ? 'active' : ''}`}>
                                {item.icon}
                            </div>
                            <span className="nav-label">{item.label}</span>
                        </div>
                        
                        <div className="nav-item-right">
                            {item.badge && (
                                <span className={`nav-badge ${item.badge === 'Active' ? 'active' : 'count'}`}>
                                    {item.badge}
                                </span>
                            )}
                            
                            {(location.pathname === item.to || hoverItem === item.id) && (
                                <ChevronRight 
                                    size={16} 
                                    className="nav-chevron"
                                />
                            )}
                        </div>

                        {/* Hover Glow Effect */}
                        {hoverItem === item.id && location.pathname !== item.to && (
                            <div className="nav-hover-glow" />
                        )}
                    </NavLink>
                ))}
            </div>

            {/* Logout Button with Glow Effect */}
            <div className="sidebar-footer">
                <button 
                    className="logout-btn"
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-1px)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.2)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                    }}
                >
                    <div className="logout-icon">
                        <LogOut size={18} />
                    </div>
                    <span>Logout</span>
                </button>
                
                {/* Version Info */}
                <div className="version-info">
                    <small>Mini-Project-II • © 2026</small>
                </div>
            </div>

            {/* Decorative Corner */}
            <div className="decorative-corner" />
        </div>
    );
}

export default Sidebar;
