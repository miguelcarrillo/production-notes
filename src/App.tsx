import { useEffect } from "react";
import "./App.css";
import { MainLayout } from "./components/Layout/MainLayout";
import { useProductionStore } from "./stores/productionStore";

function App() {
  useEffect(() => {
    const store = useProductionStore.getState();
    store.hydrateSoundboard();
    store.rehydrateDirectoryHandle();
  }, []);
  return (
    <div className="App">
      <MainLayout />
    </div>
  );
}

export default App;
