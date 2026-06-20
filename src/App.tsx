import { BackgroundDecals } from "./components/BackgroundDecals";
import { GameProvider, useGame } from "./context/GameContext";
import { Game } from "./pages/Game";
import { Home } from "./pages/Home";
import { Lobby } from "./pages/Lobby";
import styles from "./App.module.css";

/**
 * Rendering dirigido pela FASE — a fonte da verdade é o servidor (WebSocket).
 * Não usamos rotas de URL porque quem decide a tela é o estado da partida.
 */
function Screen() {
  const { phase } = useGame();
  if (phase === "home") return <Home />;
  if (phase === "lobby") return <Lobby />;
  return <Game />;
}

export default function App() {
  return (
    <GameProvider>
      <div className={styles.shell}>
        <BackgroundDecals />
        <Screen />
      </div>
    </GameProvider>
  );
}
