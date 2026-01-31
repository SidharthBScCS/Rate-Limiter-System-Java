import Sidebar from "./Sidebar";
import Heading from "./Heading";
import Card from "./Card";
import Main_Box from "./Main_Box";

function App() {
  return (
    <>
      <Sidebar />

      <div className="right-content">

        <div>
          <Heading />
        </div>
        
        <div>
          <Card />
        </div>
        
        <div>
          <Main_Box />
        </div>
        
      </div>
    </>
  );
}

export default App;
