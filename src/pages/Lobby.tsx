import { useEffect, useState } from "react";
import { getCategoryMeta } from "../constants/categoryMeta";
import { useGame } from "../context/GameContext";

const API = import.meta.env.VITE_API_URL;

interface CategoryInfo {
  category: string;
  count: number;
}

interface GameConfig {
  roundDuration: number;
  allowMultipleAttempts: boolean;
  endOnAllCorrect: boolean;
  autocomplete: boolean;
}

const DEFAULT_CONFIG: GameConfig = {
  roundDuration: 20,
  allowMultipleAttempts: true,
  endOnAllCorrect: true,
  autocomplete: true,
};

export function Lobby() {
  const { code, isHost, players, startGame, error } = useGame();
  const [categories, setCategories] = useState<CategoryInfo[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [rounds, setRounds] = useState(10);
  const [config, setConfig] = useState<GameConfig>(DEFAULT_CONFIG);
  const [showConfig, setShowConfig] = useState(false);

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

  const updateConfig = (key: keyof GameConfig, value: unknown) =>
    setConfig((prev) => ({ ...prev, [key]: value }));

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

          <div className="lobby-actions">
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

            <button className="btn-outline" onClick={() => setShowConfig(true)}>
              ⚙ Configurações
            </button>
          </div>

          <button onClick={() => startGame(selected, rounds, config)}>
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

      {/* Modal de configurações */}
      {showConfig && (
        <div className="modal-backdrop" onClick={() => setShowConfig(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>⚙ Configurações</h2>

            <label className="config-row">
              <span>Duração do round</span>
              <div className="config-input-group">
                <input
                  type="range"
                  min={5}
                  max={120}
                  step={5}
                  value={config.roundDuration}
                  onChange={(e) => updateConfig("roundDuration", Number(e.target.value))}
                />
                <span className="config-value">{config.roundDuration}s</span>
              </div>
            </label>

            <label className="config-row toggle">
              <span>
                Múltiplas tentativas
                <small>Permite errar e tentar novamente até acabar o tempo</small>
              </span>
              <input
                type="checkbox"
                checked={config.allowMultipleAttempts}
                onChange={(e) => updateConfig("allowMultipleAttempts", e.target.checked)}
              />
            </label>

            <label className="config-row toggle">
              <span>
                Encerrar quando todos acertarem
                <small>O round termina assim que o último jogador acerta</small>
              </span>
              <input
                type="checkbox"
                checked={config.endOnAllCorrect}
                onChange={(e) => updateConfig("endOnAllCorrect", e.target.checked)}
              />
            </label>

            <label className="config-row toggle">
              <span>
                Autocomplete
                <small>Sugere respostas ao digitar 3+ letras</small>
              </span>
              <input
                type="checkbox"
                checked={config.autocomplete}
                onChange={(e) => updateConfig("autocomplete", e.target.checked)}
              />
            </label>

            <button onClick={() => setShowConfig(false)}>Fechar</button>
          </div>
        </div>
      )}
    </div>
  );
}
