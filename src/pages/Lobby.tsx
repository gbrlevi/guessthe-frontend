import { useEffect, useState } from "react";
import { getCategoryMeta } from "../constants/categoryMeta";
import { useGame } from "../context/GameContext";

const API = import.meta.env.VITE_API_URL;

interface CategoryInfo {
  category: string;
  count: number;
}

export function Lobby() {
  const { code, isHost, players, startGame, error } = useGame();
  const [categories, setCategories] = useState<CategoryInfo[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [rounds, setRounds] = useState(10);

  useEffect(() => {
    fetch(`${API}/categories`)
      .then((r) => r.json())
      .then((data: CategoryInfo[]) => setCategories(data))
      .catch(() => setCategories([]));
  }, []);

  const toggle = (c: string) =>
    setSelected((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c],
    );

  const selectAll = () => setSelected(categories.map((c) => c.category));
  const clearAll = () => setSelected([]);

  return (
    <div className="lobby">
      <div className="room-code">
        Código da sala: <strong>{code}</strong>
      </div>

      <div className="players">
        <h3>Jogadores ({players.length})</h3>
        <ul>
          {players.map((p) => (
            <li key={p.id}>
              {p.name} {p.is_host && <span className="host-tag">host</span>}
            </li>
          ))}
        </ul>
      </div>

      {isHost ? (
        <div className="host-controls">
          <div className="categories-header">
            <h3>Categorias</h3>
            <div className="category-bulk-actions">
              <button className="btn-small" onClick={selectAll}>
                Todas
              </button>
              <button className="btn-small btn-outline" onClick={clearAll}>
                Nenhuma
              </button>
            </div>
          </div>

          <div className="category-grid">
            {categories.length === 0 && (
              <p>Nenhuma categoria no banco — rode os seeders.</p>
            )}
            {categories.map((c) => {
              const meta = getCategoryMeta(c.category);
              const isSelected = selected.includes(c.category);
              return (
                <label
                  key={c.category}
                  className={`category-card ${isSelected ? "selected" : ""}`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggle(c.category)}
                  />
                  <span className="cat-icon">{meta.icon}</span>
                  <span className="cat-label">{meta.label}</span>
                  <span className="cat-count">{c.count}</span>
                </label>
              );
            })}
          </div>

          <label className="rounds">
            Rounds
            <input
              type="number"
              min={1}
              max={50}
              value={rounds}
              onChange={(e) => setRounds(Number(e.target.value))}
            />
          </label>

          <button onClick={() => startGame(selected, rounds)}>
            Iniciar partida
          </button>
          <p className="hint">
            Sem categoria selecionada = sorteia de todas as categorias.
          </p>
        </div>
      ) : (
        <p className="waiting">Aguardando o host iniciar a partida…</p>
      )}

      {error && <p className="error">{error}</p>}
    </div>
  );
}
