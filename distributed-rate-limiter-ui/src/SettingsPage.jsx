import "./SettingsPage.css";
import { useEffect, useMemo, useState } from "react";
import { User, Mail, KeyRound, CalendarClock, Shield } from "lucide-react";

function SettingsPage() {
  const [admin, setAdmin] = useState(() => {
    try {
      const cached = JSON.parse(localStorage.getItem("adminUser") || "null");
      return cached && typeof cached === "object" ? cached : null;
    } catch {
      localStorage.removeItem("adminUser");
      return null;
    }
  });
  const [loadError, setLoadError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [draftName, setDraftName] = useState("");
  const [draftEmail, setDraftEmail] = useState("");

  useEffect(() => {
    let isMounted = true;
    let hasCachedAdmin = false;

    try {
      const cached = JSON.parse(localStorage.getItem("adminUser") || "null");
      hasCachedAdmin = Boolean(cached && typeof cached === "object");
    } catch {
      localStorage.removeItem("adminUser");
    }

    fetch("/api/auth/me", { credentials: "include" })
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text);
        }
        return res.json();
      })
      .then((current) => {
        if (isMounted) {
          setAdmin(current);
          setDraftName(current?.fullName || "");
          setDraftEmail(current?.email || "");
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

  const handleUpdateClick = () => {
    if (!isEditing) {
      setDraftName(admin?.fullName || "");
      setDraftEmail(admin?.email || "");
      setIsEditing(true);
      return;
    }

    const next = {
      ...(admin || {}),
      fullName: draftName.trim(),
      email: draftEmail.trim(),
    };
    setAdmin(next);
    localStorage.setItem("adminUser", JSON.stringify(next));
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setDraftName(admin?.fullName || "");
    setDraftEmail(admin?.email || "");
    setIsEditing(false);
  };

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
        <div className="settings-header-actions">
          {isEditing ? (
            <button className="settings-cta settings-cta-secondary" type="button" onClick={handleCancelEdit}>
              Cancel
            </button>
          ) : null}
          <button className="settings-cta" type="button" onClick={handleUpdateClick}>
          <KeyRound size={16} />
            {isEditing ? "Save Profile" : "Update Profile"}
          </button>
        </div>
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

          {isEditing ? (
            <div className="settings-edit-form">
              <label className="settings-edit-field">
                <span>Full Name</span>
                <input value={draftName} onChange={(e) => setDraftName(e.target.value)} />
              </label>
              <label className="settings-edit-field">
                <span>Email</span>
                <input value={draftEmail} onChange={(e) => setDraftEmail(e.target.value)} />
              </label>
            </div>
          ) : null}

          <div className="settings-rows">
            <div className="settings-row">
              <span>
                <User size={14} />
                Full Name
              </span>
              <strong>{admin?.fullName || "-"}</strong>
            </div>
            <div className="settings-row">
              <span>
                <Mail size={14} />
                Email
              </span>
              <strong>{admin?.email || "-"}</strong>
            </div>
            <div className="settings-row">
              <span>
                <Shield size={14} />
                User ID
              </span>
              <strong>{admin?.userId || "-"}</strong>
            </div>
            <div className="settings-row">
              <span>
                <CalendarClock size={14} />
                Created
              </span>
              <strong>{admin?.createdAt ? new Date(admin.createdAt).toLocaleString("en-IN") : "-"}</strong>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default SettingsPage;
