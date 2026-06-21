import { useEffect, useState } from "react";
import { Avatar } from "../components/Avatar";
import { CatIcon } from "../components/CatIcon";
import { EyesIcon, GridIcon, CopyIcon, CheckIcon, SparkleIcon } from "../components/icons";
import type { AvatarKind } from "../constants/avatars";
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
  const { code, isHost, players, startGame, error, settings, autocompleteEnabled } = useGame();
  const [categories, setCategories] = useState<CategoryInfo[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [rounds, setRounds] = useState(10);
  const [config, setConfig] = useState<GameConfig>(DEFAULT_CONFIG);
  const [showConfig, setShowConfig] = useState(false);
  const [copied, setCopied] = useState(false);

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

  const decreaseRounds = () => setRounds((r) => Math.max(1, r - 1));
  const increaseRounds = () => setRounds((r) => Math.min(50, r + 1));

  const handleCopy = () => {
    if (code) {
      navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Determine selected categories and configurations for display
  const activeSelected = isHost ? selected : (settings?.categories || []);
  const activeRounds = isHost ? rounds : (settings?.total_rounds ?? 10);
  const activeDuration = isHost ? config.roundDuration : (settings?.round_duration ?? 20);
  const activeMultiple = isHost ? config.allowMultipleAttempts : (settings?.allow_multiple_attempts ?? true);
  const activeEndAll = isHost ? config.endOnAllCorrect : (settings?.end_on_all_correct ?? true);
  const activeAutocomplete = isHost ? config.autocomplete : autocompleteEnabled;

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

        <div className={styles.lobbyGrid}>
          {/* Coluna Esquerda: Painel de Controle (Sidebar) */}
          <div className={styles.sidebar}>
            {/* Cartão de Código da Sala */}
            <div className={styles.codeBox}>
              <span className={styles.codeLabel}>Código da sala</span>
              <div className={styles.codeRow}>
                <span className={styles.codeValue}>{code}</span>
                <button
                  type="button"
                  className={`${styles.copyBtn} ${copied ? styles.copyBtnCopied : ""}`}
                  onClick={handleCopy}
                  title="Copiar código"
                >
                  {copied ? <CheckIcon size={14} /> : <CopyIcon size={14} />}
                  <span>{copied ? "Copiado!" : "Copiar"}</span>
                </button>
              </div>
            </div>

            {/* Container de Jogadores */}
            <div className={styles.sidebarSection}>
              <h3 className={styles.sectionTitle}>
                <EyesIcon size={18} />
                Jogadores <span className={styles.countBadge}>{players.length}</span>
              </h3>
              <div className={styles.playersListCard}>
                {players.map((p) => (
                  <div key={p.id} className={styles.playerRow}>
                    <div className={styles.playerRowAvatar}>
                      <Avatar kind={(p.avatar as AvatarKind) || "fox"} />
                    </div>
                    <span className={styles.playerRowName}>{p.name}</span>
                    <div className={styles.playerRowTags}>
                      {p.is_host && <span className={styles.hostTag}>host</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Painel de Configurações */}
            <div className={styles.sidebarSection}>
              <h3 className={styles.sectionTitle}>
                <SparkleIcon size={18} />
                Configurações
              </h3>

              {isHost ? (
                <div className={styles.settingsPanelHost}>
                  <div className={styles.roundsRow}>
                    <span className={styles.settingLabel}>Rounds:</span>
                    <div className={styles.stepper}>
                      <button
                        type="button"
                        className={styles.stepBtn}
                        onClick={decreaseRounds}
                        disabled={rounds <= 1}
                      >
                        -
                      </button>
                      <span className={styles.stepperValue}>{rounds}</span>
                      <button
                        type="button"
                        className={styles.stepBtn}
                        onClick={increaseRounds}
                        disabled={rounds >= 50}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <button className={styles.configBtn} onClick={() => setShowConfig(true)}>
                    ⚙ Configurações Extras
                  </button>

                  <button
                    className={styles.startBtn}
                    onClick={() => startGame(selected, rounds, config)}
                  >
                    Iniciar partida →
                  </button>
                  <p className={styles.hint}>
                    Sem categoria selecionada = sorteia de todas as categorias.
                  </p>
                </div>
              ) : (
                <div className={styles.settingsPanelGuest}>
                  <div className={styles.rulesList}>
                    <div className={styles.ruleItem}>
                      <span className={styles.ruleName}>Rounds</span>
                      <span className={styles.ruleVal}>{activeRounds}</span>
                    </div>
                    <div className={styles.ruleItem}>
                      <span className={styles.ruleName}>Tempo por rodada</span>
                      <span className={styles.ruleVal}>{activeDuration}s</span>
                    </div>
                    <div className={styles.ruleItem}>
                      <span className={styles.ruleName}>Tentativas múltiplas</span>
                      <span className={`${styles.ruleTag} ${activeMultiple ? styles.tagOn : styles.tagOff}`}>
                        {activeMultiple ? "Ativo" : "Inativo"}
                      </span>
                    </div>
                    <div className={styles.ruleItem}>
                      <span className={styles.ruleName}>Encerrar p/ todos</span>
                      <span className={`${styles.ruleTag} ${activeEndAll ? styles.tagOn : styles.tagOff}`}>
                        {activeEndAll ? "Ativo" : "Inativo"}
                      </span>
                    </div>
                    <div className={styles.ruleItem}>
                      <span className={styles.ruleName}>Sugestão (Auto)</span>
                      <span className={`${styles.ruleTag} ${activeAutocomplete ? styles.tagOn : styles.tagOff}`}>
                        {activeAutocomplete ? "Ativo" : "Inativo"}
                      </span>
                    </div>
                  </div>
                  <div className={styles.guestWaiting}>
                    <div className={styles.waitingDot} />
                    <span>Aguardando o host iniciar a partida…</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Coluna Direita: Seleção de Categorias */}
          <div className={styles.mainContent}>
            <div className={styles.catHeader}>
              <div className={styles.catHeaderLeft}>
                <h3 className={styles.sectionTitle}>
                  <GridIcon size={22} />
                  Categorias do Quiz
                </h3>
                <p className={styles.catSubtitle}>
                  {isHost
                    ? "Escolha quais categorias farão parte da partida!"
                    : "Estas são as categorias disponíveis para o jogo."}
                </p>
              </div>
              {isHost && (
                <div className={styles.bulkActions}>
                  <button className={styles.smallBtn} onClick={selectAll}>
                    Todas
                  </button>
                  <button className={styles.smallBtn} onClick={clearAll}>
                    Nenhuma
                  </button>
                </div>
              )}
            </div>

            <div className={styles.catGrid}>
              {categories.length === 0 && (
                <p className={styles.emptyCats}>Nenhuma categoria no banco — rode os seeders.</p>
              )}
              {categories.map((c) => {
                const meta = getCategoryMeta(c.category);
                const isSelected = activeSelected.includes(c.category);

                if (isHost) {
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
                } else {
                  return (
                    <div
                      key={c.category}
                      className={`${styles.catCard} ${styles.catCardGuest} ${
                        isSelected ? styles.catCardSelectedGuest : ""
                      }`}
                    >
                      <div className={styles.catCardIcon}>
                        <CatIcon kind={meta.iconKind} frame={isSelected ? "#FFE08A" : "#FFF1E0"} />
                      </div>
                      <span className={styles.catCardLabel}>{meta.label}</span>
                      <span className={styles.catCardCount}>{c.count}</span>
                    </div>
                  );
                }
              })}
            </div>
          </div>
        </div>

        {error && <p className={styles.error}>{error}</p>}
      </div>

      {/* Modal de configurações (Host) */}
      {showConfig && (
        <div className={styles.modalBackdrop} onClick={() => setShowConfig(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 className={styles.modalTitle}>⚙ Configurações Extras</h2>

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
              Salvar e Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
