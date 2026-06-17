import { useState } from "react";
import { useGame } from "../context/GameContext";

export function Home() {
  const { createRoom, joinRoom, error } = useGame();
  const [name, setName] = useState("");
  const [code, setCode] = useState("");

  const canCreate = name.trim().length > 0;
  const canJoin = canCreate && code.trim().length >= 3;

  return (
    <div className="home">
      <h1>LDKQuiz</h1>
      <p className="subtitle">Quiz multiplayer em tempo real</p>

      <label>
        Seu nome
        <input value={name} onChange={(e) => setName(e.target.value)} maxLength={24} placeholder="Ex.: Ash" />
      </label>

      <div className="home-actions">
        <button disabled={!canCreate} onClick={() => createRoom(name.trim())}>
          Criar sala
        </button>

        <div className="join-row">
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            maxLength={6}
            placeholder="CÓDIGO"
          />
          <button disabled={!canJoin} onClick={() => joinRoom(code.trim(), name.trim())}>
            Entrar
          </button>
        </div>
      </div>

      {error && <p className="error">{error}</p>}
    </div>
  );
}
