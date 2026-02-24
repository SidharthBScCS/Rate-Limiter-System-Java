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
import { useEffect, useState } from "react";
import './Sidebar.css';
import { apiUrl } from "./apiBase";

function Sidebar() {
    const location = useLocation();
    const [hoverItem, setHoverItem] = useState(null);
    const [adminName, setAdminName] = useState("");
    const [adminInitials, setAdminInitials] = useState("AD");

    const handleLogout = () => {
        fetch(apiUrl("/api/auth/logout"), { method: "POST", credentials: "include" })
            .catch(() => {})
            .finally(() => {
                localStorage.removeItem("adminUser");
                window.location.href = "/login";
            });
    };

    const menuItems = [
        { 
            id: "dashboard", 
            icon: <LayoutGrid size={20} />, 
            label: "Dashboard",
            to: "/dashboard"
        },
        { 
            id: "limits", 
            icon: <Scale size={20} />, 
            label: "Rules & Limits",
            to: "/rules-limits"
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
            to: "/settings"
        },
    ];

    useEffect(() => {
        let isMounted = true;

        let hasCachedAdmin = false;
        try {
            const cached = JSON.parse(localStorage.getItem("adminUser") || "null");
            if (cached && typeof cached === "object") {
                hasCachedAdmin = true;
                setAdminName(cached.fullName || cached.userId || "");
                setAdminInitials(cached.initials || "AD");
            }
        } catch {
            localStorage.removeItem("adminUser");
        }

        fetch(apiUrl("/api/auth/me"), { credentials: "include" })
            .then(async (res) => {
                if (!res.ok) {
                    const text = await res.text();
                    throw new Error(text);
                }
                return res.json();
            })
            .then((data) => {
                if (isMounted) {
                    setAdminName(data.fullName || data.userId || "");
                    setAdminInitials(data.initials || "AD");
                    localStorage.setItem("adminUser", JSON.stringify(data));
                }
            })
            .catch(() => {
                if (isMounted) {
                    if (!hasCachedAdmin) {
                        setAdminName("");
                        setAdminInitials("AD");
                    }
                }
                if (!hasCachedAdmin) {
                    window.location.href = "/login";
                }
            });

        return () => {
            isMounted = false;
        };
    }, []);


    return (
        <div className="sidebar-container">

            {/* User Profile with Gradient */}
            <div className="user-profile">
                <div className="user-avatar">
                    {adminInitials}
                    <div className="online-indicator">
                        <div className="online-dot" />
                    </div>
                </div>
                
                <div className="user-info">
                    <h6 className="user-name">{adminName || "ADMIN USER"}</h6>
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
                    onClick={handleLogout}
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
                    <small>Mini-Project-II</small>
                </div>
            </div>

            {/* Decorative Corner */}
            <div className="decorative-corner" />
        </div>
    );
}

export default Sidebar;
