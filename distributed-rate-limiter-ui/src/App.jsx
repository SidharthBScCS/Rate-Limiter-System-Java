import Sidebar from "./Sidebar";
import Heading from "./Heading";
import Card from "./Card";
import Table_Box from "./Table_Box";
import Analytics from "./Analytics";
import RulesLimits from "./RulesLimits";
import SettingsPage from "./SettingsPage";
import LandingPage from "./LandingPage";
import LoginPage from "./LoginPage";
import { useState } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";

function App() {
  const [refreshTick, setRefreshTick] = useState(0);
  const location = useLocation();
  const isFullWidthPage =
    location.pathname === "/" || location.pathname === "/login";

  const handleCreated = () => {
    setRefreshTick((v) => v + 1);
  };

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
                <Heading onCreated={handleCreated} />
                <Card refreshTick={refreshTick} />
                <Table_Box refreshTick={refreshTick} />
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
