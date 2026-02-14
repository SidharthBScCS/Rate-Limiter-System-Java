import { 
    LayoutGrid, 
    Scale, 
    BarChart3, 
    Settings, 
    LogOut,
    ChevronRight,
    Shield,
    Bell
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import './Sidebar.css';

function Sidebar() {
    const location = useLocation();
    const [hoverItem, setHoverItem] = useState(null);
    const [adminData, setAdminData] = useState({
        name: "",
        initials: "AD",
        role: "Administrator",
        email: ""
    });

    const handleLogout = async () => {
        try {
            await fetch("/api/auth/logout", { 
                method: "POST", 
                credentials: "include" 
            });
        } catch (error) {
            console.error("Logout error:", error);
        } finally {
            localStorage.removeItem("adminUser");
            sessionStorage.clear();
            window.location.href = "/login";
        }
    };

    const menuItems = [
        { 
            id: "dashboard", 
            icon: <LayoutGrid size={20} />, 
            label: "Dashboard",
            to: "/dashboard",
            badge: null
        },
        { 
            id: "limits", 
            icon: <Scale size={20} />, 
            label: "Rules & Limits",
            to: "/rules-limits",
            badge: "Active"
        },
        { 
            id: "analytics", 
            icon: <BarChart3 size={20} />, 
            label: "Analytics",
            to: "/analytics",
            badge: "12"
        },
        { 
            id: "settings", 
            icon: <Settings size={20} />, 
            label: "Settings",
            to: "/settings",
            badge: null
        },
    ];

    const getInitials = (name) => {
        if (!name) return "AD";
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    useEffect(() => {
        let isMounted = true;
        let hasCachedAdmin = false;

        // Check cached data
        try {
            const cached = JSON.parse(localStorage.getItem("adminUser") || "null");
            if (cached && typeof cached === "object") {
                hasCachedAdmin = true;
                setAdminData({
                    name: cached.fullName || cached.userId || "",
                    initials: cached.initials || getInitials(cached.fullName) || "AD",
                    role: cached.role || "Administrator",
                    email: cached.email || ""
                });
            }
        } catch {
            localStorage.removeItem("adminUser");
        }

        // Fetch fresh data
        const fetchAdminData = async () => {
            try {
                const response = await fetch("/api/auth/me", { 
                    credentials: "include",
                    headers: {
                        'Cache-Control': 'no-cache'
                    }
                });
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }
                
                const data = await response.json();
                
                if (isMounted) {
                    const userData = {
                        name: data.fullName || data.userId || "",
                        initials: data.initials || getInitials(data.fullName) || "AD",
                        role: data.role || "Administrator",
                        email: data.email || ""
                    };
                    
                    setAdminData(userData);
                    localStorage.setItem("adminUser", JSON.stringify(data));
                }
            } catch (error) {
                console.error("Failed to fetch admin data:", error);
                
                if (isMounted && !hasCachedAdmin) {
                    // Redirect to login only if no cached data
                    window.location.href = "/login";
                }
            }
        };

        fetchAdminData();

        return () => {
            isMounted = false;
        };
    }, []);

    return (
        <div className="sidebar-container">
            {/* User Profile */}
            <div className="user-profile">
                <div className="user-avatar">
                    {adminData.initials}
                    <div className="online-indicator">
                        <div className="online-dot" />
                    </div>
                </div>
                
                <div className="user-info">
                    <h6 className="user-name">
                        {adminData.name || "Admin User"}
                    </h6>
                    <div className="user-role">
                        {adminData.role}
                    </div>
                </div>
            </div>

            {/* Navigation Menu */}
            <div className="nav-menu">
                {menuItems.map((item) => (
                    <NavLink
                        key={item.id}
                        to={item.to}
                        onMouseEnter={() => setHoverItem(item.id)}
                        onMouseLeave={() => setHoverItem(null)}
                        className={({ isActive }) => 
                            `nav-item ${isActive ? 'active' : ''}`
                        }
                        end={item.to === '/dashboard'}
                    >
                        <div className="nav-item-content">
                            <div className={`nav-icon ${
                                location.pathname === item.to ? 'active' : ''
                            }`}>
                                {item.icon}
                            </div>
                            <span className="nav-label">{item.label}</span>
                        </div>
                        
                        <div className="nav-item-right">
                            {item.badge && (
                                <span className={`nav-badge ${
                                    item.badge === 'Active' ? 'active' : 'count'
                                }`}>
                                    {item.badge}
                                </span>
                            )}
                            
                            <ChevronRight 
                                size={16} 
                                className="nav-chevron"
                                style={{
                                    opacity: location.pathname === item.to || 
                                             hoverItem === item.id ? 1 : 0
                                }}
                            />
                        </div>

                        {/* Hover Glow Effect */}
                        {hoverItem === item.id && 
                         location.pathname !== item.to && (
                            <div className="nav-hover-glow" />
                        )}
                    </NavLink>
                ))}
            </div>

            {/* Footer */}
            <div className="sidebar-footer">
                <button 
                    className="logout-btn"
                    onClick={handleLogout}
                    aria-label="Logout"
                >
                    <span className="logout-icon">
                        <LogOut size={18} />
                    </span>
                    <span>Logout</span>
                </button>
                
                {/* Version Info */}
                <div className="version-info">
                    <span className="version-badge">
                        Mini-Project-II • v1.0.0
                    </span>
                </div>
            </div>

            {/* Decorative Corner */}
            <div className="decorative-corner" />
        </div>
    );
}

export default Sidebar;