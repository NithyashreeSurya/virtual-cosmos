import { useEffect } from "react";
import { startGame } from "./game";

function App() {
  useEffect(() => {
    startGame();
  }, []);

  return null;
}

export default App;
