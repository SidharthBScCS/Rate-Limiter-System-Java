import Sidebar from "./Sidebar";
import Heading from "./Heading";
import Card from "./Card";
import Table_Box from "./Table_Box";
import Analytics from "./Analytics";
import RulesLimits from "./RulesLimits";
import SettingsPage from "./SettingsPage";
import LandingPage from "./LandingPage";
import LoginPage from "./LoginPage";
import { useEffect, useState } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";

function hasAuthenticatedUser() {
  try {
    const cached = JSON.parse(localStorage.getItem("adminUser") || "null");
    if (!cached || typeof cached !== "object") return false;
    return Boolean(cached.userId || cached.fullName);
  } catch {
    localStorage.removeItem("adminUser");
    return false;
  }
}

function App() {
  const location = useLocation();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const isAuthenticated = hasAuthenticatedUser();
  const isFullWidthPage =
    location.pathname === "/" || location.pathname === "/login";
  const showSidebar = !isFullWidthPage && isAuthenticated;

  useEffect(() => {
    setMobileNavOpen(false);
  }, [location.pathname]);

  return (
    <>
      {showSidebar ? (
        <>
          <button
            type="button"
            className="mobile-nav-toggle"
            aria-label={mobileNavOpen ? "Close menu" : "Open menu"}
            onClick={() => setMobileNavOpen((v) => !v)}
          >
            {mobileNavOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div
            className={`mobile-nav-overlay ${mobileNavOpen ? "open" : ""}`}
            onClick={() => setMobileNavOpen(false)}
          />
          <Sidebar isMobileOpen={mobileNavOpen} />
        </>
      ) : null}

      <div className={`right-content ${isFullWidthPage ? "full-width" : ""}`}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route
            path="/login"
            element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />}
          />
          <Route
            path="/dashboard"
            element={
              isAuthenticated ? (
                <>
                  <Heading />
                  <Card refreshTick={0} />
                  <Table_Box refreshTick={0} />
                </>
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/analytics"
            element={isAuthenticated ? <Analytics /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/rules-limits"
            element={isAuthenticated ? <RulesLimits /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/settings"
            element={isAuthenticated ? <SettingsPage /> : <Navigate to="/login" replace />}
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </>
  );
}

export default App;
