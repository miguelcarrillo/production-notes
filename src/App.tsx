import { useEffect } from "react"; // + Import useEffect
import "./App.css";
import { MainLayout } from "./components/Layout/MainLayout";
import { useProductionStore } from "./stores/productionStore"; // + Import the store

function App() {
  useEffect(() => {
    useProductionStore.getState().hydrateSoundboard();
  }, []);
  return (
    <div className="App">
      <MainLayout />
    </div>
  );
}

export default App;
