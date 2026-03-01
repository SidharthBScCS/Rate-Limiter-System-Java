import { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import StatsCards from "./StatsCards";
import ApiTable from "./ApiTable";

function Dashboard() {
  const [refreshTick] = useState(0);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="app-layout">
      <Sidebar isMobileOpen={isMobileOpen} />
      
      <main className="right-content">
        <Header toggleSidebar={() => setIsMobileOpen(!isMobileOpen)} />
        <StatsCards refreshTick={refreshTick} />
        <ApiTable refreshTick={refreshTick} />
      </main>
    </div>
  );
}

export default Dashboard;