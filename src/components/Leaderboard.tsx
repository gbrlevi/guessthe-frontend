import { avatarFor } from "../constants/avatars";
import type { PlayerPublic } from "../types/messages";
import { Avatar } from "./Avatar";
import { MedalIcon, MicIcon } from "./icons";
import styles from "./Leaderboard.module.css";

const MEDAL_COLORS = ["#FFC62E", "#D9DEE3", "#E08A4A"];

/**
 * Placar ao vivo da Arena. Usa os jogadores reais (lobby_update); os scores
 * atualizam entre rounds (scoreboard). Avatares são derivados do id (avatarFor),
 * pois o backend não transmite avatar por jogador.
 */
export function Leaderboard({ players }: { players: PlayerPublic[] }) {
  const sorted = [...players].sort((a, b) => b.score - a.score);
  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <div className={styles.title}>
          <MicIcon size={20} />
          Líderes
        </div>
      </div>
      <div className={styles.rows}>
        {sorted.length === 0 && <div className={styles.empty}>Sem jogadores ainda…</div>}
        {sorted.map((p, i) => (
          <div key={p.id} className={styles.row}>
            <div className={styles.rank}>
              {i < 3 ? <MedalIcon size={23} color={MEDAL_COLORS[i]} /> : <span className={styles.rankNum}>#{i + 1}</span>}
            </div>
            <div className={styles.avatar}>
              <Avatar kind={avatarFor(p.id)} />
            </div>
            <div className={styles.name}>{p.name}</div>
            <div className={styles.score}>{p.score}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
