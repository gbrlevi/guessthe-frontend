import { useState } from "react";
import { Avatar } from "../components/Avatar";
import { CatIcon, type CatIconKind } from "../components/CatIcon";
import { EyesIcon, GlobeIcon, GridIcon, MicIcon, PencilIcon, SparkleIcon } from "../components/icons";
import { AVATAR_KINDS } from "../constants/avatars";
import { useGame } from "../context/GameContext";
import styles from "./Home.module.css";

interface MockRoom {
  id: string;
  name: string;
  cat: string;
  kind: CatIconKind;
  players: string;
  goal: string;
  lang: string;
}

// Salas mockadas / estáticas (decorativas). O backend ainda não lista salas
// (não há GET /rooms). TODO(backend): trocar por dados reais quando existir.
const MOCK_ROOMS: MockRoom[] = [
  { id: "r1", name: "Sala do Caos", cat: "Aberturas de Anime", kind: "anime", players: "7/10", goal: "120", lang: "PT" },
  { id: "r2", name: "Só os Brabos", cat: "Efeitos Sonoros", kind: "sfx", players: "4/8", goal: "80", lang: "PT" },
  { id: "r3", name: "Cinéfilos BR", cat: "Plots Mal Explicados", kind: "plot", players: "9/12", goal: "150", lang: "PT" },
  { id: "r4", name: "Gamers Unidos", cat: "Steam Reviews", kind: "steam", players: "2/6", goal: "100", lang: "EN" },
  { id: "r5", name: "Cine Clube", cat: "Capas de Filme", kind: "coverMovie", players: "5/10", goal: "120", lang: "PT" },
  { id: "r5b", name: "Game Art", cat: "Capas de Jogo", kind: "coverGame", players: "6/10", goal: "120", lang: "PT" },
  { id: "r5c", name: "Otaku Mode", cat: "Capas de Anime", kind: "coverAnime", players: "7/12", goal: "150", lang: "PT" },
  { id: "r6", name: "Mestre Pokémon", cat: "Quem é esse Pokémon?", kind: "pokemon", players: "8/8", goal: "150", lang: "PT" },
  { id: "r7", name: "Ouvido Absoluto", cat: "Cry do Pokémon", kind: "cry", players: "3/6", goal: "100", lang: "PT" },
  { id: "r8", name: "Mundo Tech", cat: "Logos Tech", kind: "logos", players: "6/12", goal: "120", lang: "EN" },
];

export function Home() {
  const { createRoom, joinRoom, error } = useGame();
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [avatarIndex, setAvatarIndex] = useState(0);

  const canCreate = name.trim().length > 0;
  const canJoin = canCreate && code.trim().length >= 3;
  const avatarKind = AVATAR_KINDS[avatarIndex];

  const prevAvatar = () => setAvatarIndex((i) => (i - 1 + AVATAR_KINDS.length) % AVATAR_KINDS.length);
  const nextAvatar = () => setAvatarIndex((i) => (i + 1) % AVATAR_KINDS.length);

  return (
    <div className={styles.screen}>
      <div className={styles.card}>
        {/* ribbon */}
        <div className={styles.ribbon}>
          <div className={styles.ribbonWrap}>
            <span className={`${styles.ribbonCorner} ${styles.ribbonCornerLeft}`} />
            <span className={`${styles.ribbonCorner} ${styles.ribbonCornerRight}`} />
            <div className={styles.ribbonInner}>JOGAR</div>
          </div>
        </div>

        <div className={styles.grid}>
          {/* identidade */}
          <div>
            <div className={styles.badge}>
              <SparkleIcon size={16} />
              <span>BEM-VINDO, JOGADOR!</span>
            </div>
            <h1 className={styles.title}>
              Monte seu
              <br />
              personagem
            </h1>
            <p className={styles.subtitle}>Escolha um avatar, digite seu nick e crie ou entre numa sala!</p>

            <div className={styles.carousel}>
              <button className={styles.arrowBtn} onClick={prevAvatar} aria-label="Avatar anterior">
                ‹
              </button>
              <div className={styles.avatarWrap}>
                <div className={styles.avatarBox}>
                  <Avatar kind={avatarKind} />
                </div>
                <div className={styles.editIcon}>
                  <PencilIcon size={19} />
                </div>
              </div>
              <button className={styles.arrowBtn} onClick={nextAvatar} aria-label="Próximo avatar">
                ›
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
              placeholder="Ex: RaposaVeloz"
            />

            <button className={styles.primaryBtn} disabled={!canCreate} onClick={() => createRoom(name.trim())}>
              CRIAR SALA →
            </button>

            <div className={styles.divider}>ou entre com código</div>

            <div className={styles.joinRow}>
              <input
                className={styles.codeInput}
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                maxLength={6}
                placeholder="CÓDIGO"
              />
              <button className={styles.joinBtn} disabled={!canJoin} onClick={() => joinRoom(code.trim(), name.trim())}>
                Entrar
              </button>
            </div>

            {error && <p className={styles.error}>{error}</p>}
          </div>

          {/* salas (estático / decorativo) */}
          <div>
            <div className={styles.roomsHeader}>
              <h2 className={styles.roomsTitle}>
                <GridIcon size={24} />
                Salas abertas
              </h2>
              <div className={styles.liveBadge}>● {MOCK_ROOMS.length} ao vivo</div>
            </div>
            <div className={styles.roomsGrid}>
              {MOCK_ROOMS.map((room, i) => (
                <div key={room.id} className={styles.roomCard} style={{ animationDelay: `${(i * 0.06).toFixed(2)}s` }}>
                  <div className={styles.roomIconWrap}>
                    <div className={styles.roomIcon}>
                      <CatIcon kind={room.kind} />
                    </div>
                    <div className={styles.roomBadge}>
                      <EyesIcon size={13} />
                      {room.players}
                    </div>
                  </div>
                  <div className={styles.roomMeta}>
                    <div className={styles.roomName}>{room.name}</div>
                    <div className={styles.roomCat}>{room.cat}</div>
                  </div>
                  <div className={styles.roomFooter}>
                    <span>
                      <MicIcon size={14} />
                      {room.goal}
                    </span>
                    <span>
                      <GlobeIcon size={14} />
                      {room.lang}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
