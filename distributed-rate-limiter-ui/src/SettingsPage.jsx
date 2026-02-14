import "./SettingsPage.css";
import { useEffect, useMemo, useState } from "react";
import { 
  User, 
  Mail, 
  CalendarClock, 
  Shield,
  Award,
  AlertCircle,
  Clock
} from "lucide-react";

function SettingsPage() {
  const [admin, setAdmin] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    
    const loadAdminData = async () => {
      try {
        // Check cache first
        const cached = localStorage.getItem("adminUser");
        if (cached) {
          try {
            const parsed = JSON.parse(cached);
            if (parsed && typeof parsed === "object") {
              setAdmin(parsed);
            }
          } catch {
            localStorage.removeItem("adminUser");
          }
        }

        // Fetch fresh data
        const response = await fetch("/api/auth/me", { 
          credentials: "include",
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        });
        
        if (!response.ok) {
          if (response.status === 401) {
            throw new Error("Unauthorized");
          }
          throw new Error(`HTTP ${response.status}`);
        }
        
        const data = await response.json();
        
        if (isMounted) {
          setAdmin(data);
          setLoadError("");
          localStorage.setItem("adminUser", JSON.stringify(data));
        }
      } catch (err) {
        console.error("Failed to load admin data:", err);
        
        if (isMounted) {
          if (!admin) {
            setLoadError("Unable to load profile. Please try again.");
          }
          
          // Only redirect if no cached data and unauthorized
          if (err.message === "Unauthorized" && !admin) {
            window.location.href = "/login";
          }
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadAdminData();

    return () => {
      isMounted = false;
    };
  }, []);

  const userInitials = useMemo(() => {
    if (!admin?.fullName) return "AD";
    
    const nameParts = admin.fullName.trim().split(/\s+/);
    if (nameParts.length === 1) {
      return nameParts[0].slice(0, 2).toUpperCase();
    }
    return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
  }, [admin]);

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-IN", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch {
      return dateString;
    }
  };

  const getMemberSince = (dateString) => {
    if (!dateString) return "-";
    
    try {
      const joinDate = new Date(dateString);
      const now = new Date();
      const months = Math.floor((now - joinDate) / (1000 * 60 * 60 * 24 * 30));
      
      if (months < 1) return "Less than a month";
      if (months === 1) return "1 month";
      return `${months} months`;
    } catch {
      return "-";
    }
  };

  if (isLoading) {
    return (
      <div className="settings-page">
        <div className="settings-loading">
          <div className="loading-spinner" />
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="settings-page">
      {/* Header Section */}
      <div className="settings-header">
        <h1 className="page-title">Profile Settings</h1>
        <p className="page-subtitle">
          Manage your personal information and account details
        </p>
      </div>

      {/* Profile Card */}
      <div className="profile-card">
        {/* Profile Header with Avatar */}
        <div className="profile-header">
          <div className="profile-avatar">
            {userInitials}
          </div>
          <div className="profile-info">
            <h4>{admin?.fullName || "Admin User"}</h4>
            <span className="profile-role-badge">
              <Shield size={14} />
              Administrator
            </span>
            <p className="profile-email">
              <Mail size={16} />
              {admin?.email || "No email provided"}
            </p>
          </div>
        </div>

        {/* Error Message */}
        {loadError && (
          <div className="settings-error">
            <AlertCircle size={18} />
            {loadError}
          </div>
        )}

        {/* Profile Details */}
        <div className="settings-rows">
          <div className="settings-row">
            <span>
              <User size={18} />
              Full Name
            </span>
            <strong>{admin?.fullName || "—"}</strong>
          </div>
          
          <div className="settings-row">
            <span>
              <Mail size={18} />
              Email Address
            </span>
            <strong>{admin?.email || "—"}</strong>
          </div>
          
          <div className="settings-row">
            <span>
              <Shield size={18} />
              User ID
            </span>
            <strong>{admin?.userId || "—"}</strong>
          </div>
          
          <div className="settings-row">
            <span>
              <Award size={18} />
              Member Since
            </span>
            <div 
              className="date-with-tooltip" 
              data-full-date={formatDate(admin?.createdAt)}
            >
              <Clock size={14} />
              {getMemberSince(admin?.createdAt)}
            </div>
          </div>
          
          <div className="settings-row">
            <span>
              <CalendarClock size={18} />
              Last Updated
            </span>
            <div 
              className="date-with-tooltip" 
              data-full-date={formatDate(admin?.updatedAt || admin?.createdAt)}
            >
              {admin?.updatedAt 
                ? new Date(admin.updatedAt).toLocaleDateString('en-IN')
                : "—"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SettingsPage;/*  */