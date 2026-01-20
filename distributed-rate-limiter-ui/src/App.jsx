import Sidebar from "./Sidebar";
import Navigator from "./Navigator";
import Card from "./Card";
import Main_Box from "./Main_Box";

function App() {
  return (
    <>
      <Sidebar />

      <div className="right-content">
        <Navigator />
        <Card />
        <Main_Box />
      </div>
    </>
  );
}

export default App;
