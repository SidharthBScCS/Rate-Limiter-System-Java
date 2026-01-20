import Navigator from "./Navigator";
import Card from "./Card";
import Main_Box from "./Main_Box";
import Sidebar from "./Sidebar";

function App() {
  return (
    <div className="app-layout">
      <Sidebar />
      <div>
        <Navigator />
        <Card />
        <Main_Box />
      </div>
    </div>
  );
}

export default App;
