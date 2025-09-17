import { useEffect } from "react"; // + Import useEffect
import "./App.css";
import { MainLayout } from "./components/Layout/MainLayout";
import { useProductionStore } from "./stores/productionStore"; // + Import the store

function App() {
  useEffect(() => {
    const store = useProductionStore.getState();
    store.hydrateSoundboard();
    store.rehydrateDirectoryHandle(); // + Add this line
  }, []);
  return (
    <div className="App">
      <MainLayout />
    </div>
  );
}

export default App;
