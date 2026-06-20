import { useEffect, useState } from "react";
import { Avatar } from "../components/Avatar";
import { CatIcon } from "../components/CatIcon";
import { EyesIcon, GridIcon } from "../components/icons";
import { avatarFor } from "../constants/avatars";
import { getCategoryMeta } from "../constants/categoryMeta";
import { useGame } from "../context/GameContext";
import styles from "./Lobby.module.css";

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
    setSelected((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));

  const selectAll = () => setSelected(categories.map((c) => c.category));
  const clearAll = () => setSelected([]);

  const updateConfig = (key: keyof GameConfig, value: unknown) =>
    setConfig((prev) => ({ ...prev, [key]: value }));

  return (
    <div className={styles.screen}>
      <div className={styles.card}>
        <div className={styles.ribbon}>
          <div className={styles.ribbonWrap}>
            <span className={`${styles.ribbonCorner} ${styles.ribbonCornerLeft}`} />
            <span className={`${styles.ribbonCorner} ${styles.ribbonCornerRight}`} />
            <div className={styles.ribbonInner}>LOBBY</div>
          </div>
        </div>

        <div className={styles.codeRow}>
          <div className={styles.codeChip}>
            <span className={styles.codeLabel}>Código da sala</span>
            <span className={styles.codeValue}>{code}</span>
          </div>
        </div>

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>
            <EyesIcon size={20} />
            Jogadores ({players.length})
          </h3>
          <div className={styles.playerList}>
            {players.map((p) => (
              <div key={p.id} className={styles.playerChip}>
                <div className={styles.playerAvatar}>
                  <Avatar kind={avatarFor(p.id)} />
                </div>
                {p.name}
                {p.is_host && <span className={styles.hostTag}>host</span>}
              </div>
            ))}
          </div>
        </div>

        {isHost ? (
          <>
            <div className={styles.catHeader}>
              <h3 className={styles.sectionTitle}>
                <GridIcon size={20} />
                Categorias
              </h3>
              <div className={styles.bulkActions}>
                <button className={styles.smallBtn} onClick={selectAll}>
                  Todas
                </button>
                <button className={styles.smallBtn} onClick={clearAll}>
                  Nenhuma
                </button>
              </div>
            </div>

            <div className={styles.catGrid}>
              {categories.length === 0 && (
                <p className={styles.emptyCats}>Nenhuma categoria no banco — rode os seeders.</p>
              )}
              {categories.map((c) => {
                const meta = getCategoryMeta(c.category);
                const isSelected = selected.includes(c.category);
                return (
                  <button
                    key={c.category}
                    type="button"
                    className={`${styles.catCard} ${isSelected ? styles.catCardSelected : ""}`}
                    onClick={() => toggle(c.category)}
                  >
                    <div className={styles.catCardIcon}>
                      <CatIcon kind={meta.iconKind} frame={isSelected ? "#FFE08A" : "#FFF1E0"} />
                    </div>
                    <span className={styles.catCardLabel}>{meta.label}</span>
                    <span className={styles.catCardCount}>{c.count}</span>
                  </button>
                );
              })}
            </div>

            <div className={styles.actionsRow}>
              <label className={styles.rounds}>
                Rounds
                <input
                  className={styles.roundsInput}
                  type="number"
                  min={1}
                  max={50}
                  value={rounds}
                  onChange={(e) => setRounds(Number(e.target.value))}
                />
              </label>
              <button className={styles.configBtn} onClick={() => setShowConfig(true)}>
                ⚙ Configurações
              </button>
            </div>

            <button className={styles.startBtn} onClick={() => startGame(selected, rounds, config)}>
              Iniciar partida →
            </button>
            <p className={styles.hint}>Sem categoria selecionada = sorteia de todas as categorias.</p>
          </>
        ) : (
          <p className={styles.waiting}>Aguardando o host iniciar a partida…</p>
        )}

        {error && <p className={styles.error}>{error}</p>}
      </div>

      {/* Modal de configurações */}
      {showConfig && (
        <div className={styles.modalBackdrop} onClick={() => setShowConfig(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 className={styles.modalTitle}>⚙ Configurações</h2>

            <label className={styles.configRow}>
              <span>Duração do round</span>
              <div className={styles.configInputGroup}>
                <input
                  type="range"
                  min={5}
                  max={120}
                  step={5}
                  value={config.roundDuration}
                  onChange={(e) => updateConfig("roundDuration", Number(e.target.value))}
                />
                <span className={styles.configValue}>{config.roundDuration}s</span>
              </div>
            </label>

            <label className={styles.configRow}>
              <span>
                Múltiplas tentativas
                <small className={styles.configSmall}>Permite errar e tentar novamente até acabar o tempo</small>
              </span>
              <input
                type="checkbox"
                checked={config.allowMultipleAttempts}
                onChange={(e) => updateConfig("allowMultipleAttempts", e.target.checked)}
              />
            </label>

            <label className={styles.configRow}>
              <span>
                Encerrar quando todos acertarem
                <small className={styles.configSmall}>O round termina assim que o último jogador acerta</small>
              </span>
              <input
                type="checkbox"
                checked={config.endOnAllCorrect}
                onChange={(e) => updateConfig("endOnAllCorrect", e.target.checked)}
              />
            </label>

            <label className={styles.configRow}>
              <span>
                Autocomplete
                <small className={styles.configSmall}>Sugere respostas ao digitar 3+ letras</small>
              </span>
              <input
                type="checkbox"
                checked={config.autocomplete}
                onChange={(e) => updateConfig("autocomplete", e.target.checked)}
              />
            </label>

            <button className={styles.modalClose} onClick={() => setShowConfig(false)}>
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
