import { useEffect } from "react";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { BackgroundDecals } from "./components/BackgroundDecals";
import { GameProvider, useGame } from "./context/GameContext";
import { Game } from "./pages/Game";
import { Home } from "./pages/Home";
import { Lobby } from "./pages/Lobby";
import styles from "./App.module.css";

/**
 * Rendering dirigido pela FASE — a fonte da verdade é o servidor (WebSocket).
 * As rotas de URL refletem o estado atual (cosmético + compartilhável),
 * mas não controlam o fluxo — quem decide a tela é a fase recebida via WS.
 */
function Screen() {
  const { phase, code } = useGame();
  const navigate = useNavigate();

  useEffect(() => {
    if (phase === "home") {
      navigate("/", { replace: true });
    } else if (code) {
      navigate(`/room/${code}`, { replace: true });
    }
  }, [phase, code, navigate]);

  if (phase === "home") return <Home />;
  if (phase === "lobby") return <Lobby />;
  return <Game />;
}

export default function App() {
  return (
    <GameProvider>
      <div className={styles.shell}>
        <BackgroundDecals />
        <Routes>
          <Route path="/" element={<Screen />} />
          <Route path="/room/:code" element={<Screen />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </GameProvider>
  );
}
