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

function App() {
  const location = useLocation();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const isFullWidthPage =
    location.pathname === "/" || location.pathname === "/login";

  useEffect(() => {
    setMobileNavOpen(false);
  }, [location.pathname]);

  return (
    <>
      {!isFullWidthPage ? (
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
          <Sidebar isMobileOpen={mobileNavOpen} onNavigate={() => setMobileNavOpen(false)} />
        </>
      ) : null}

      <div className={`right-content ${isFullWidthPage ? "full-width" : ""}`}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/dashboard"
            element={
              <>
                <Heading />
                <Card refreshTick={0} />
                <Table_Box refreshTick={0} />
              </>
            }
          />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/rules-limits" element={<RulesLimits />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </>
  );
}

export default App;
