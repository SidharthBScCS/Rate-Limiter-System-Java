import Sidebar from "./Sidebar";
import Heading from "./Heading";
import Card from "./Card";
import Main_Box from "./Main_Box";
import { useState } from "react";

function App() {
  const [refreshTick, setRefreshTick] = useState(0);

  const handleCreated = () => {
    setRefreshTick((v) => v + 1);
  };

  return (
    <>
      <Sidebar />

      <div className="right-content">

        <div>
          <Heading onCreated={handleCreated} />
        </div>
        
        <div>
          <Card refreshTick={refreshTick} />
        </div>
        
        <div>
          <Main_Box refreshTick={refreshTick} />
        </div>
        
      </div>
    </>
  );
}

export default App;
