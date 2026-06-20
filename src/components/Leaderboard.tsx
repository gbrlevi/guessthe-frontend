import type { AvatarKind } from "../constants/avatars";
import type { PlayerPublic } from "../types/messages";
import { Avatar } from "./Avatar";
import { MedalIcon, MicIcon } from "./icons";
import styles from "./Leaderboard.module.css";

const MEDAL_COLORS = ["#FFC62E", "#D9DEE3", "#E08A4A"];

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
              <Avatar kind={(p.avatar as AvatarKind) || "fox"} />
            </div>
            <div className={styles.name}>{p.name}</div>
            <div className={styles.score}>{p.score}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
