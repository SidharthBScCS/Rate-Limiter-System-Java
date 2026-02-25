import Sidebar from "./Sidebar";
import Heading from "./Heading";
import Card from "./Card";
import Table_Box from "./Table_Box";
import Analytics from "./Analytics";
import RulesLimits from "./RulesLimits";
import SettingsPage from "./SettingsPage";
import LandingPage from "./LandingPage";
import LoginPage from "./LoginPage";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";

function App() {
  const location = useLocation();
  const isFullWidthPage =
    location.pathname === "/" || location.pathname === "/login";

  return (
    <>
      {!isFullWidthPage ? <Sidebar /> : null}

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
