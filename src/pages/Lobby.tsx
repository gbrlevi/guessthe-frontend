import { useEffect, useState } from "react";
import { Avatar } from "../components/Avatar";
import { CatIcon } from "../components/CatIcon";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { SoundToggle } from "../components/SoundToggle";
import { Toggle } from "../components/Toggle";
import {
  EyesIcon,
  GridIcon,
  CopyIcon,
  CheckIcon,
  SparkleIcon,
  ExitIcon,
  PencilIcon,
  FatArrowIcon,
} from "../components/icons";
import { AVATAR_KINDS, type AvatarKind } from "../constants/avatars";
import { getCategoryMeta } from "../constants/categoryMeta";
import { useGame } from "../context/GameContext";
import { sfx } from "../lib/sfx";
import type { GameMode, TermoMode } from "../types/messages";
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
  depixelSpeed: number;
  tensionEnabled: boolean;
  tensionPercent: number; // % das rodadas finais em tensão (ex.: 30 → últimos 30%)
  // Modo Termo
  gameMode: GameMode;
  termoMode: TermoMode;
  submissionCooldown: number; // 0–5s
  termoRoundDuration: number; // s (padrão 60)
  termoHintDelay: number; // s (padrão 30)
  mixedTermoPercent: number; // % de rodadas de Termo no modo Misto (padrão 50)
}

const DEFAULT_CONFIG: GameConfig = {
  roundDuration: 20,
  allowMultipleAttempts: true,
  endOnAllCorrect: true,
  autocomplete: true,
  depixelSpeed: 5,
  tensionEnabled: true,
  tensionPercent: 30,
  gameMode: "quiz",
  termoMode: "pvp_individual",
  submissionCooldown: 2,
  termoRoundDuration: 60,
  termoHintDelay: 30,
  mixedTermoPercent: 50,
};

export function Lobby() {
  const {
    code,
    isHost,
    players,
    startGame,
    updateSettings,
    error,
    settings,
    autocompleteEnabled,
    myId,
    myAvatar,
    myName,
    leaveRoom,
    changeIdentity,
  } = useGame();
  const [categories, setCategories] = useState<CategoryInfo[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [rounds, setRounds] = useState(10);
  const [config, setConfig] = useState<GameConfig>(DEFAULT_CONFIG);
  const [showConfig, setShowConfig] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showLeave, setShowLeave] = useState(false);
  const [showIdentity, setShowIdentity] = useState(false);
  const [draftName, setDraftName] = useState("");
  const [draftAvatarIndex, setDraftAvatarIndex] = useState(0);
  const [starting, setStarting] = useState(false);

  const draftAvatar = AVATAR_KINDS[draftAvatarIndex] as AvatarKind;
  const prevDraftAvatar = () =>
    setDraftAvatarIndex((i) => (i - 1 + AVATAR_KINDS.length) % AVATAR_KINDS.length);
  const nextDraftAvatar = () => setDraftAvatarIndex((i) => (i + 1) % AVATAR_KINDS.length);

  const openIdentity = () => {
    setDraftName(myName);
    const idx = AVATAR_KINDS.indexOf(myAvatar);
    setDraftAvatarIndex(idx >= 0 ? idx : 0);
    setShowIdentity(true);
  };
  const saveIdentity = () => {
    changeIdentity(draftName.trim() || myName || "Jogador", draftAvatar);
    setShowIdentity(false);
  };

  useEffect(() => {
    fetch(`${API}/categories`)
      .then((r) => r.json())
      .then((data: CategoryInfo[]) => setCategories(data))
      .catch(() => setCategories([]));
  }, []);

  // Se o servidor devolver erro (ex: sem questões), libera o botão de iniciar
  useEffect(() => {
    if (error) setStarting(false);
  }, [error]);

  const toggle = (c: string) => {
    setSelected((prev) => {
      const next = prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c];
      updateSettings({ categories: next });
      return next;
    });
  };

  const selectAll = () => {
    const mode = config.gameMode;
    const all = categories
      .filter((c) =>
        mode === "termo"
          ? c.category.startsWith("termo_")
          : mode === "quiz"
            ? !c.category.startsWith("termo_")
            : true, // misto: tudo
      )
      .map((c) => c.category);
    setSelected(all);
    updateSettings({ categories: all });
  };
  const clearAll = () => {
    setSelected([]);
    updateSettings({ categories: [] });
  };

  const updateConfig = (key: keyof GameConfig, value: unknown) => {
    setConfig((prev) => {
      const next = { ...prev, [key]: value };
      // A dica nunca pode atrasar mais que a própria rodada.
      if (key === "termoRoundDuration") {
        next.termoHintDelay = Math.min(prev.termoHintDelay, value as number);
      }
      // Sincroniza com o servidor em tempo real (só campos relevantes ao backend)
      if (key === "roundDuration") updateSettings({ roundDuration: value as number });
      if (key === "allowMultipleAttempts") updateSettings({ allowMultipleAttempts: value as boolean });
      if (key === "endOnAllCorrect") updateSettings({ endOnAllCorrect: value as boolean });
      if (key === "depixelSpeed") updateSettings({ depixelSpeed: value as number });
      if (key === "tensionEnabled") updateSettings({ tensionEnabled: value as boolean });
      if (key === "tensionPercent") updateSettings({ tensionRatio: 1 - (value as number) / 100 });
      if (key === "gameMode") updateSettings({ gameMode: value as GameMode });
      if (key === "termoMode") updateSettings({ termoMode: value as TermoMode });
      if (key === "submissionCooldown") updateSettings({ submissionCooldown: value as number });
      if (key === "termoRoundDuration") {
        updateSettings({ termoRoundDuration: value as number, termoHintDelay: next.termoHintDelay });
      }
      if (key === "termoHintDelay") updateSettings({ termoHintDelay: value as number });
      if (key === "mixedTermoPercent") updateSettings({ mixedTermoRatio: (value as number) / 100 });
      return next;
    });
  };

  const decreaseRounds = () => {
    setRounds((r) => {
      const next = Math.max(1, r - 1);
      updateSettings({ totalRounds: next });
      return next;
    });
  };
  const increaseRounds = () => {
    setRounds((r) => {
      const next = Math.min(50, r + 1);
      updateSettings({ totalRounds: next });
      return next;
    });
  };

  const handleCopy = () => {
    if (code) {
      navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleStart = () => {
    if (starting) return;
    sfx.click();
    setStarting(true);
    const startConfig = { ...config, mixedTermoRatio: config.mixedTermoPercent / 100 };
    startGame(selected, rounds, startConfig);
  };

  // Valores visíveis pelo guest refletem as configurações sincronizadas pelo host
  const activeSelected = isHost ? selected : (settings?.categories || []);
  const activeRounds = isHost ? rounds : (settings?.total_rounds ?? 10);
  const activeDuration = isHost ? config.roundDuration : (settings?.round_duration ?? 20);
  const activeMultiple = isHost ? config.allowMultipleAttempts : (settings?.allow_multiple_attempts ?? true);
  const activeEndAll = isHost ? config.endOnAllCorrect : (settings?.end_on_all_correct ?? true);
  const activeAutocomplete = isHost ? config.autocomplete : autocompleteEnabled;
  const activeDepixelSpeed = isHost ? config.depixelSpeed : (settings?.depixel_speed ?? 5);
  const activeTensionEnabled = isHost ? config.tensionEnabled : (settings?.tension_enabled ?? true);
  const activeTensionPercent = isHost
    ? config.tensionPercent
    : Math.round((1 - (settings?.tension_ratio ?? 0.7)) * 100);

  // Modo de jogo + parâmetros do Termo (host = config local; guest = settings do servidor)
  const activeGameMode: GameMode = isHost ? config.gameMode : (settings?.game_mode ?? "quiz");
  const activeTermoMode: TermoMode = isHost ? config.termoMode : (settings?.termo_mode ?? "pvp_individual");
  const activeCooldown = isHost ? config.submissionCooldown : (settings?.submission_cooldown ?? 2);
  const activeTermoDuration = isHost ? config.termoRoundDuration : (settings?.termo_round_duration ?? 60);
  const activeHintDelay = isHost ? config.termoHintDelay : (settings?.termo_hint_delay ?? 30);
  const activeMixedPercent = isHost
    ? config.mixedTermoPercent
    : Math.round((settings?.mixed_termo_ratio ?? 0.5) * 100);
  const isTermoMode = activeGameMode === "termo";
  const isMixedMode = activeGameMode === "misto";
  const showsTermo = activeGameMode !== "quiz"; // termo ou misto
  const showsQuiz = activeGameMode !== "termo"; // quiz ou misto
  const modeLabel = isMixedMode ? "Misto" : isTermoMode ? "Termo PvP" : "Quiz";
  const termoModeLabel =
    activeTermoMode === "pvp_individual" ? "PvP Individual" : "Tabuleiro Compartilhado";

  // Categorias visíveis conforme o modo: Termo só termo_*, Quiz só não-termo, Misto tudo.
  const visibleCategories = categories.filter((c) =>
    isTermoMode
      ? c.category.startsWith("termo_")
      : isMixedMode
        ? true
        : !c.category.startsWith("termo_"),
  );

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
                {players.map((p) => {
                  const isMe = p.id === myId;
                  const inner = (
                    <>
                      <div className={styles.playerRowAvatar}>
                        <Avatar kind={(p.avatar as AvatarKind) || "fox"} />
                      </div>
                      <span className={styles.playerRowName}>{p.name}</span>
                      <div className={styles.playerRowTags}>
                        {p.is_host && <span className={styles.hostTag}>host</span>}
                        {isMe && <span className={styles.meTag}>você</span>}
                        {isMe && (
                          <span className={styles.editHint} aria-hidden="true">
                            <PencilIcon size={13} />
                          </span>
                        )}
                      </div>
                    </>
                  );
                  return isMe ? (
                    <button
                      key={p.id}
                      type="button"
                      className={`${styles.playerRow} ${styles.playerRowMe}`}
                      onClick={openIdentity}
                      title="Editar seu nick e avatar"
                    >
                      {inner}
                    </button>
                  ) : (
                    <div key={p.id} className={styles.playerRow}>
                      {inner}
                    </div>
                  );
                })}
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
                  <div className={styles.modeRow}>
                    <span className={styles.settingLabel}>Modo:</span>
                    <div className={styles.modeSeg}>
                      <button
                        type="button"
                        className={`${styles.modeSegBtn} ${config.gameMode === "quiz" ? styles.modeSegActive : ""}`}
                        onClick={() => updateConfig("gameMode", "quiz")}
                      >
                        Quiz
                      </button>
                      <button
                        type="button"
                        className={`${styles.modeSegBtn} ${config.gameMode === "termo" ? styles.modeSegActive : ""}`}
                        onClick={() => updateConfig("gameMode", "termo")}
                      >
                        Termo PvP
                      </button>
                      <button
                        type="button"
                        className={`${styles.modeSegBtn} ${config.gameMode === "misto" ? styles.modeSegActive : ""}`}
                        onClick={() => updateConfig("gameMode", "misto")}
                      >
                        Misto
                      </button>
                    </div>
                  </div>

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
                    className={`${styles.startBtn} ${starting ? styles.startBtnLoading : ""}`}
                    onClick={handleStart}
                    disabled={starting}
                  >
                    {starting ? (
                      <span className={styles.spinner} aria-hidden="true" />
                    ) : null}
                    {starting ? "Iniciando…" : "Iniciar partida →"}
                  </button>
                  <p className={styles.hint}>
                    Sem categoria selecionada = sorteia de todas as categorias.
                  </p>
                </div>
              ) : (
                <div className={styles.settingsPanelGuest}>
                  <div className={styles.rulesList}>
                    <div className={styles.ruleItem}>
                      <span className={styles.ruleName}>Modo</span>
                      <span className={styles.ruleVal}>{modeLabel}</span>
                    </div>
                    <div className={styles.ruleItem}>
                      <span className={styles.ruleName}>Rounds</span>
                      <span className={styles.ruleVal}>{activeRounds}</span>
                    </div>
                    {isMixedMode && (
                      <div className={styles.ruleItem}>
                        <span className={styles.ruleName}>Proporção de Termo</span>
                        <span className={styles.ruleVal}>{activeMixedPercent}%</span>
                      </div>
                    )}
                    {showsTermo && (
                      <>
                        <div className={styles.ruleItem}>
                          <span className={styles.ruleName}>Tipo de Termo</span>
                          <span className={styles.ruleVal}>{termoModeLabel}</span>
                        </div>
                        <div className={styles.ruleItem}>
                          <span className={styles.ruleName}>Tempo por rodada</span>
                          <span className={styles.ruleVal}>{activeTermoDuration}s</span>
                        </div>
                        <div className={styles.ruleItem}>
                          <span className={styles.ruleName}>Cooldown de envio</span>
                          <span className={styles.ruleVal}>{activeCooldown}s</span>
                        </div>
                        <div className={styles.ruleItem}>
                          <span className={styles.ruleName}>Atraso da dica</span>
                          <span className={styles.ruleVal}>{activeHintDelay}s</span>
                        </div>
                      </>
                    )}
                    {showsQuiz && (
                      <>
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
                        <div className={styles.ruleItem}>
                          <span className={styles.ruleName}>Vel. despixelização</span>
                          <span className={styles.ruleVal}>{activeDepixelSpeed}/10</span>
                        </div>
                        <div className={styles.ruleItem}>
                          <span className={styles.ruleName}>Modo Tensão</span>
                          <span className={`${styles.ruleTag} ${activeTensionEnabled ? styles.tagOn : styles.tagOff}`}>
                            {activeTensionEnabled ? `Ativo (${activeTensionPercent}%)` : "Inativo"}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                  <div className={styles.guestWaiting}>
                    <div className={styles.waitingDot} />
                    <span>Aguardando o host iniciar a partida…</span>
                  </div>
                </div>
              )}
            </div>

            {/* Rodapé do painel: som + sair da sala */}
            <div className={styles.sidebarFooter}>
              <SoundToggle />
              <button
                type="button"
                className={styles.leaveBtn}
                onClick={() => {
                  sfx.click();
                  setShowLeave(true);
                }}
              >
                <ExitIcon size={16} />
                Sair da sala
              </button>
            </div>
          </div>

          {/* Coluna Direita: Seleção de Categorias */}
          <div className={styles.mainContent}>
            <div className={styles.catHeader}>
              <div className={styles.catHeaderLeft}>
                <h3 className={styles.sectionTitle}>
                  <GridIcon size={22} />
                  {isTermoMode ? "Temas do Termo" : isMixedMode ? "Categorias & Temas" : "Categorias do Quiz"}
                </h3>
                <p className={styles.catSubtitle}>
                  {isHost
                    ? isTermoMode
                      ? "Escolha os temas das palavras do Termo!"
                      : isMixedMode
                        ? "Escolha categorias de quiz e temas de Termo — as rodadas serão intercaladas."
                        : "Escolha quais categorias farão parte da partida!"
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
              {visibleCategories.length === 0 && (
                <p className={styles.emptyCats}>
                  {isTermoMode
                    ? "Nenhum tema de Termo no banco — rode python -m scripts.seed_termo."
                    : "Nenhuma categoria no banco — rode os seeders."}
                </p>
              )}
              {visibleCategories.map((c) => {
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

            <div className={styles.modalBody}>
            {config.gameMode !== "quiz" && (
              <>
                {config.gameMode === "misto" && (
                  <label className={styles.configRow}>
                    <span>
                      Proporção de Termo
                      <small className={styles.configSmall}>Quanto da partida é Termo (o resto é Quiz)</small>
                    </span>
                    <div className={styles.configInputGroup}>
                      <input
                        className={styles.range}
                        type="range"
                        min={10}
                        max={90}
                        step={10}
                        value={config.mixedTermoPercent}
                        onChange={(e) => updateConfig("mixedTermoPercent", Number(e.target.value))}
                      />
                      <span className={styles.configValue}>{config.mixedTermoPercent}%</span>
                    </div>
                  </label>
                )}

                <label className={styles.configRow}>
                  <span>
                    Tipo de Termo
                    <small className={styles.configSmall}>PvP individual (grade própria) ou tabuleiro compartilhado</small>
                  </span>
                  <select
                    className={styles.select}
                    value={config.termoMode}
                    onChange={(e) => updateConfig("termoMode", e.target.value as TermoMode)}
                  >
                    <option value="pvp_individual">PvP Individual</option>
                    <option value="tabuleiro_compartilhado">Tabuleiro Compartilhado</option>
                  </select>
                </label>

                <label className={styles.configRow}>
                  <span>
                    Cooldown de envio
                    <small className={styles.configSmall}>Intervalo mínimo entre palpites (0–5s)</small>
                  </span>
                  <div className={styles.configInputGroup}>
                    <input
                      className={styles.range}
                      type="range"
                      min={0}
                      max={5}
                      step={0.5}
                      value={config.submissionCooldown}
                      onChange={(e) => updateConfig("submissionCooldown", Number(e.target.value))}
                    />
                    <span className={styles.configValue}>{config.submissionCooldown}s</span>
                  </div>
                </label>

                <label className={styles.configRow}>
                  <span>
                    Duração do round (Termo)
                    <small className={styles.configSmall}>Tempo de cada rodada de Termo</small>
                  </span>
                  <div className={styles.configInputGroup}>
                    <input
                      className={styles.range}
                      type="range"
                      min={15}
                      max={180}
                      step={5}
                      value={config.termoRoundDuration}
                      onChange={(e) => updateConfig("termoRoundDuration", Number(e.target.value))}
                    />
                    <span className={styles.configValue}>{config.termoRoundDuration}s</span>
                  </div>
                </label>

                <label className={styles.configRow}>
                  <span>
                    Atraso da dica
                    <small className={styles.configSmall}>Quando a dica aparece na rodada</small>
                  </span>
                  <div className={styles.configInputGroup}>
                    <input
                      className={styles.range}
                      type="range"
                      min={0}
                      max={config.termoRoundDuration}
                      step={5}
                      value={config.termoHintDelay}
                      onChange={(e) => updateConfig("termoHintDelay", Number(e.target.value))}
                    />
                    <span className={styles.configValue}>{config.termoHintDelay}s</span>
                  </div>
                </label>
              </>
            )}

            {config.gameMode !== "termo" && (
              <>
            <label className={styles.configRow}>
              <span>Duração do round</span>
              <div className={styles.configInputGroup}>
                <input
                  className={styles.range}
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

            <div className={styles.configRow}>
              <span>
                Múltiplas tentativas
                <small className={styles.configSmall}>Permite errar e tentar novamente até acabar o tempo</small>
              </span>
              <Toggle
                checked={config.allowMultipleAttempts}
                onChange={(v) => updateConfig("allowMultipleAttempts", v)}
                label="Múltiplas tentativas"
              />
            </div>

            <div className={styles.configRow}>
              <span>
                Encerrar quando todos acertarem
                <small className={styles.configSmall}>O round termina assim que o último jogador acerta</small>
              </span>
              <Toggle
                checked={config.endOnAllCorrect}
                onChange={(v) => updateConfig("endOnAllCorrect", v)}
                label="Encerrar quando todos acertarem"
              />
            </div>

            <div className={styles.configRow}>
              <span>
                Autocomplete
                <small className={styles.configSmall}>Sugere respostas ao digitar 3+ letras</small>
              </span>
              <Toggle
                checked={config.autocomplete}
                onChange={(v) => updateConfig("autocomplete", v)}
                label="Autocomplete"
              />
            </div>

            <label className={styles.configRow}>
              <span>
                Velocidade de despixelização
                <small className={styles.configSmall}>1 = lento, 10 = rápido</small>
              </span>
              <div className={styles.configInputGroup}>
                <input
                  className={styles.range}
                  type="range"
                  min={1}
                  max={10}
                  step={1}
                  value={config.depixelSpeed}
                  onChange={(e) => updateConfig("depixelSpeed", Number(e.target.value))}
                />
                <span className={styles.configValue}>{config.depixelSpeed}</span>
              </div>
            </label>

            <div className={styles.configRow}>
              <span>
                Modo Tensão
                <small className={styles.configSmall}>Mudança no rítmo da partida. Rodadas finais valem pontuação dobrada</small>
              </span>
              <Toggle
                checked={config.tensionEnabled}
                onChange={(v) => updateConfig("tensionEnabled", v)}
                label="Modo Tensão"
              />
            </div>

            <label className={`${styles.configRow} ${!config.tensionEnabled ? styles.configRowDisabled : ""}`}>
              <span>
                Rodadas em tensão
                <small className={styles.configSmall}>Percentual final da partida com Modo Tensão ativo</small>
              </span>
              <div className={styles.configInputGroup}>
                <input
                  className={styles.range}
                  type="range"
                  min={10}
                  max={50}
                  step={5}
                  value={config.tensionPercent}
                  disabled={!config.tensionEnabled}
                  onChange={(e) => updateConfig("tensionPercent", Number(e.target.value))}
                />
                <span className={styles.configValue}>{config.tensionPercent}%</span>
              </div>
            </label>
              </>
            )}
            </div>

            <button className={styles.modalClose} onClick={() => setShowConfig(false)}>
              Salvar e Fechar
            </button>
          </div>
        </div>
      )}

      {/* Modal de edição de perfil (nick + avatar) — replica via WS sem reconectar */}
      {showIdentity && (
        <div className={styles.modalBackdrop} onClick={() => setShowIdentity(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 className={styles.modalTitle}>Editar perfil</h2>

            <div className={styles.identityCarousel}>
              <button
                type="button"
                className={styles.identityArrow}
                onClick={prevDraftAvatar}
                aria-label="Avatar anterior"
              >
                <FatArrowIcon dir="left" size={24} />
              </button>
              <div className={styles.identityAvatar}>
                <Avatar kind={draftAvatar} />
              </div>
              <button
                type="button"
                className={styles.identityArrow}
                onClick={nextDraftAvatar}
                aria-label="Próximo avatar"
              >
                <FatArrowIcon dir="right" size={24} />
              </button>
            </div>

            <label className={styles.identityLabel} htmlFor="editNick">
              Seu nick
            </label>
            <input
              id="editNick"
              className={styles.identityInput}
              value={draftName}
              onChange={(e) => setDraftName(e.target.value)}
              maxLength={24}
              placeholder="Seu nick"
            />
            <div className={styles.charCount}>{draftName.length}/24</div>

            <button className={styles.modalClose} onClick={saveIdentity}>
              Salvar perfil
            </button>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={showLeave}
        title="Sair da sala?"
        message={
          isHost
            ? "Você é o host. Ao sair, outro jogador assume o controle da sala."
            : "Você voltará para a tela inicial."
        }
        confirmLabel="Sair"
        cancelLabel="Ficar"
        tone="danger"
        onConfirm={() => {
          setShowLeave(false);
          leaveRoom();
        }}
        onCancel={() => setShowLeave(false)}
      />
    </div>
  );
}
