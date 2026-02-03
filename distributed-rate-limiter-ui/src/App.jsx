import Sidebar from "./Sidebar";
import Heading from "./Heading";
import Card from "./Card";
import Table_Box from "./Table_Box";
import Analytics from "./Analytics";
import { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

function App() {
  const [refreshTick, setRefreshTick] = useState(0);

  const handleCreated = () => {
    setRefreshTick((v) => v + 1);
  };

  return (
    <>
      <Sidebar />

      <div className="right-content">

        <Routes>
          <Route
            path="/"
            element={
              <>
                <Heading onCreated={handleCreated} />
                <Card refreshTick={refreshTick} />
                <Table_Box refreshTick={refreshTick} />
              </>
            }
          />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        
      </div>
    </>
  );
}

export default App;
