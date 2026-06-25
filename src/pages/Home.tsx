import { useEffect, useRef, useState } from "react";
import { Avatar } from "../components/Avatar";
import { SoundToggle } from "../components/SoundToggle";
import { EyesIcon, FatArrowIcon, GridIcon, SparkleIcon } from "../components/icons";
import { AVATAR_KINDS, type AvatarKind } from "../constants/avatars";
import { useGame } from "../context/GameContext";
import { sfx } from "../lib/sfx";
import styles from "./Home.module.css";

const API = import.meta.env.VITE_API_URL;

interface LiveRoom {
  code: string;
  name: string;
  player_count: number;
  state: string;
  current_round: number;
  total_rounds: number;
}

const STATE_LABEL: Record<string, string> = {
  lobby: "Aguardando…",
  starting: "Iniciando…",
  question: "Em partida",
  reveal: "Em partida",
  scoreboard: "Em partida",
  finished: "Finalizando…",
};

export function Home() {
  const { createRoom, joinRoom, error } = useGame();
  const [name, setName] = useState(() => {
    try {
      return localStorage.getItem("ldk-nickname") || "";
    } catch {
      return "";
    }
  });
  const [roomName, setRoomName] = useState(() => {
    try {
      return localStorage.getItem("ldk-roomname") || "";
    } catch {
      return "";
    }
  });
  const [code, setCode] = useState("");
  const [avatarIndex, setAvatarIndex] = useState(() => {
    try {
      const saved = localStorage.getItem("ldk-avatar");
      if (saved) {
        const idx = AVATAR_KINDS.indexOf(saved as AvatarKind);
        if (idx !== -1) return idx;
      }
    } catch {
      // ignore
    }
    return 0;
  });
  const [rooms, setRooms] = useState<LiveRoom[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [view, setView] = useState<"home" | "rooms">("home");
  const [pendingRoomCode, setPendingRoomCode] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const avatarKind = AVATAR_KINDS[avatarIndex] as AvatarKind;

  useEffect(() => {
    try {
      localStorage.setItem("ldk-nickname", name);
    } catch {
      // ignore
    }
  }, [name]);

  useEffect(() => {
    try {
      localStorage.setItem("ldk-avatar", avatarKind);
    } catch {
      // ignore
    }
  }, [avatarKind]);

  useEffect(() => {
    try {
      localStorage.setItem("ldk-roomname", roomName);
    } catch {
      // ignore
    }
  }, [roomName]);

  const prevAvatar = () => setAvatarIndex((i) => (i - 1 + AVATAR_KINDS.length) % AVATAR_KINDS.length);
  const nextAvatar = () => setAvatarIndex((i) => (i + 1) % AVATAR_KINDS.length);

  const canCreate = name.trim().length > 0;
  const canJoin = canCreate && code.trim().length >= 3;

  const fetchRooms = () => {
    fetch(`${API}/rooms`)
      .then((r) => r.json())
      .then((data: LiveRoom[]) => {
        setRooms(data);
        setLoadingRooms(false);
      })
      .catch(() => setLoadingRooms(false));
  };

  useEffect(() => {
    fetchRooms();
    pollRef.current = setInterval(fetchRooms, 5000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  // Deep link: ?room=CODE pré-preenche o campo de código ao abrir o app.
  useEffect(() => {
    const r = new URLSearchParams(window.location.search).get("room");
    if (r) setCode(r.toUpperCase().slice(0, 6));
  }, []);

  const handleJoinRoom = (roomCode: string) => {
    if (!name.trim()) {
      setPendingRoomCode(roomCode);
      return;
    }
    joinRoom(roomCode, name.trim(), avatarKind);
  };

  const handleModalConfirm = () => {
    if (name.trim() && pendingRoomCode) {
      joinRoom(pendingRoomCode, name.trim(), avatarKind);
      setPendingRoomCode(null);
    }
  };

  return (
    <div className={styles.screen}>
      <SoundToggle className={styles.homeSound} />
      <div className={styles.pageLayout}>
      {/* Logo — LDKQuiz wordmark */}
      <div className={styles.logo}>
        <div className={styles.logoWordmark}>
          <span className={styles.logoLdk}>LDK</span>
          <span className={styles.logoQuiz}>Quiz</span>
        </div>
        <div className={styles.logoTagline}>TEKKID · games · MUNDO ANIME</div>
        <div className={styles.logoSparkles}>
          <svg width="22" height="22" viewBox="0 0 24 24">
            <path d="M12,2 l2.4,6 6,2.4 -6,2.4 -2.4,6 -2.4,-6 -6,-2.4 6,-2.4 Z" fill="#FFC62E" stroke="#2A1206" strokeWidth="2" strokeLinejoin="round" />
          </svg>
          <svg width="16" height="16" viewBox="0 0 24 24">
            <path d="M12,2 l2.4,6 6,2.4 -6,2.4 -2.4,6 -2.4,-6 -6,-2.4 6,-2.4 Z" fill="#FFFFFF" stroke="#2A1206" strokeWidth="2" strokeLinejoin="round" />
          </svg>
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path d="M12,2 l2.4,6 6,2.4 -6,2.4 -2.4,6 -2.4,-6 -6,-2.4 6,-2.4 Z" fill="#3FBF63" stroke="#2A1206" strokeWidth="2" strokeLinejoin="round" />
          </svg>
        </div>
      </div>

      <div className={styles.card}>

        {view === "home" ? (
          <div className={`${styles.homeContent} ${styles.fadeContainer}`}>
            <div className={styles.homeColumns}>
              {/* Coluna da Identidade (Esquerda) */}
              <div className={styles.homeLeftCol}>
                <div className={styles.badge}>
                  <SparkleIcon size={16} />
                  <span>BEM-VINDO, JOGADOR!</span>
                </div>
                <h1 className={styles.title}>
                  Monte seu
                  <br />
                  personagem
                </h1>
                <p className={styles.subtitle}>Escolha um avatar e digite seu nick!</p>

                <div className={styles.carousel}>
                  <button className={styles.arrowBtn} onClick={prevAvatar} aria-label="Avatar anterior">
                    <FatArrowIcon dir="left" size={26} />
                  </button>
                  <div className={styles.avatarWrap}>
                    <div className={styles.avatarBox}>
                      <Avatar kind={avatarKind} />
                    </div>
                  </div>
                  <button className={styles.arrowBtn} onClick={nextAvatar} aria-label="Próximo avatar">
                    <FatArrowIcon dir="right" size={26} />
                  </button>
                </div>

                <label className={styles.nickLabel} htmlFor="nick">
                  Seu nick
                </label>
                <input
                  id="nick"
                  className={styles.nickInput}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={24}
                  placeholder="Ex: QifiShiina"
                />
                <div className={styles.nickCount}>{name.length}/24</div>
              </div>

              {/* Coluna das Opções de Sala (Direita) */}
              <div className={styles.homeRightCol}>
                <label className={styles.nickLabel} htmlFor="roomname">
                  Nome da sala (opcional)
                </label>
                <input
                  id="roomname"
                  className={styles.nickInput}
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  maxLength={50}
                  placeholder="Ex: LDKRUST RUIM"
                />

                <div className={styles.buttonGroup}>
                  <button
                    className={styles.primaryBtn}
                    disabled={!canCreate}
                    onClick={() => {
                      sfx.click();
                      createRoom(name.trim(), avatarKind, roomName.trim() || undefined);
                    }}
                  >
                    CRIAR SALA →
                  </button>
                  <button
                    className={styles.roomsBtn}
                    type="button"
                    onClick={() => setView("rooms")}
                  >
                    SALAS
                  </button>
                </div>

                <div className={styles.divider}>ou entre com código</div>

                <div className={styles.joinRow}>
                  <input
                    className={styles.codeInput}
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    maxLength={6}
                    placeholder="CÓDIGO"
                  />
                  <button
                    className={styles.joinBtn}
                    disabled={!canJoin}
                    onClick={() => {
                      sfx.click();
                      joinRoom(code.trim(), name.trim(), avatarKind);
                    }}
                  >
                    Entrar
                  </button>
                </div>

                {error && <p className={styles.error}>{error}</p>}
              </div>
            </div>
          </div>
        ) : (
          <div className={`${styles.roomsContent} ${styles.fadeContainer}`}>
            <div className={styles.roomsHeader}>
              <h2 className={styles.roomsTitle}>
                <GridIcon size={24} />
                Salas abertas
              </h2>
              <div className={styles.roomsHeaderRight}>
                <div className={styles.liveBadge}>● {rooms.length} ao vivo</div>
                <button
                  className={styles.backBtn}
                  type="button"
                  onClick={() => setView("home")}
                >
                  ← Voltar
                </button>
              </div>
            </div>

            {loadingRooms && <p className={styles.roomsLoading}>Carregando salas…</p>}

            {!loadingRooms && rooms.length === 0 && (
              <div className={styles.roomsEmpty}>
                <span>Nenhuma sala aberta no momento.</span>
                <br />
                <span>Crie a sua!</span>
              </div>
            )}

            <div className={styles.roomsGrid}>
              {rooms.map((room, i) => {
                const inGame = room.state !== "lobby" && room.state !== "finished";
                const stateLabel = STATE_LABEL[room.state] ?? room.state;
                const roundLabel = inGame && room.total_rounds > 0
                  ? `Rodada ${room.current_round}/${room.total_rounds}`
                  : stateLabel;

                return (
                  <button
                    key={room.code}
                    type="button"
                    className={styles.roomCard}
                    style={{ animationDelay: `${(i * 0.06).toFixed(2)}s` }}
                    onClick={() => handleJoinRoom(room.code)}
                    title={`Entrar em ${room.name}`}
                  >
                    <div className={styles.roomCodeBadge}>{room.code}</div>
                    <div className={styles.roomPlayersBadge}>
                      <EyesIcon size={13} />
                      {room.player_count} jogador{room.player_count !== 1 ? "es" : ""}
                    </div>
                    <div className={styles.roomMeta}>
                      <div className={styles.roomName}>{room.name}</div>
                      <div className={styles.roomCat}>{roundLabel}</div>
                    </div>
                    <div className={styles.roomFooter}>
                      <span
                        className={`${styles.roomStateDot} ${inGame ? styles.roomStateDotActive : ""}`}
                      >
                        {inGame ? "● Em jogo" : "● Lobby"}
                      </span>
                      <span className={styles.roomJoinHint}>Clique para entrar →</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
      </div>

      {pendingRoomCode && (
        <div className={styles.modalOverlay} onClick={() => setPendingRoomCode(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <SparkleIcon size={18} />
              <span className={styles.modalTitle}>Falta só o seu nick!</span>
            </div>
            <p className={styles.modalBody}>
              Escolha um nickname antes de entrar na sala{" "}
              <strong>{pendingRoomCode}</strong>.
            </p>
            <input
              id="modal-nick"
              className={styles.nickInput}
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleModalConfirm()}
              maxLength={24}
              placeholder="Ex: QifiShiina"
              autoFocus
            />
            <div className={styles.nickCount}>{name.length}/24</div>
            <div className={styles.modalActions}>
              <button
                className={styles.primaryBtn}
                disabled={!name.trim()}
                onClick={handleModalConfirm}
              >
                Entrar na sala →
              </button>
              <button
                className={styles.backBtn}
                onClick={() => setPendingRoomCode(null)}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
