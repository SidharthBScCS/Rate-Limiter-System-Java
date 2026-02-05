import "./SettingsPage.css";
import { useEffect, useMemo, useState } from "react";
import { User, Mail, ShieldCheck, KeyRound, CalendarClock, Shield } from "lucide-react";

function SettingsPage() {
  const [admin, setAdmin] = useState(null);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let isMounted = true;
    let hasCachedAdmin = false;

    try {
      const cached = JSON.parse(localStorage.getItem("adminUser") || "null");
      if (cached && typeof cached === "object") {
        hasCachedAdmin = true;
        setAdmin(cached);
      }
    } catch {
      localStorage.removeItem("adminUser");
    }

    const loadCurrent = fetch("/api/auth/me", { credentials: "include" })
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text);
        }
        return res.json();
      });

    loadCurrent
      .then((current) => {
        if (isMounted) {
          setAdmin(current);
          setLoadError("");
          localStorage.setItem("adminUser", JSON.stringify(current));
        }
      })
      .catch((err) => {
        console.error("LOAD ADMIN ERROR:", err);
        if (isMounted && !hasCachedAdmin) {
          setLoadError("Unable to load admin profile.");
          window.location.href = "/login";
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const initials = useMemo(() => {
    const name = admin?.fullName || admin?.userId || "A";
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }, [admin]);

  return (
    <div className="settings-page">
      <div className="settings-header">
        <div>
          <h1 className="page-title">Profile Settings</h1>
          <p className="page-subtitle">Manage your personal information and security</p>
        </div>
        <button className="settings-cta">
          <KeyRound size={16} />
          Update Profile
        </button>
      </div>

      <div className="settings-grid">
        <div className="settings-card profile-card">
          <div className="profile-header">
            <div className="profile-avatar">{initials}</div>
            <div>
              <h4>{admin?.fullName || "Admin User"}</h4>
              <p>Admin • RateLimit Team</p>
            </div>
          </div>

          {loadError ? <div className="settings-error">{loadError}</div> : null}

          <div className="settings-rows">
            <div className="settings-row">
              <span>
                <User size={14} />
                Full Name
              </span>
              <strong>{admin?.fullName || "—"}</strong>
            </div>
            <div className="settings-row">
              <span>
                <Mail size={14} />
                Email
              </span>
              <strong>{admin?.email || "—"}</strong>
            </div>
            <div className="settings-row">
              <span>
                <Shield size={14} />
                User ID
              </span>
              <strong>{admin?.userId || "—"}</strong>
            </div>
            <div className="settings-row">
              <span>
                <CalendarClock size={14} />
                Created
              </span>
              <strong>{admin?.createdAt ? new Date(admin.createdAt).toLocaleString("en-IN") : "—"}</strong>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

export default SettingsPage;
