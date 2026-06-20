import type { AvatarKind } from "../constants/avatars";
import { Avatar } from "./Avatar";
import { MedalIcon, StarIcon } from "./icons";
import styles from "./ScorerList.module.css";

export interface ScorerEntry {
  id?: string;
  name: string;
  score: number;
  avatar?: string;
}

const MEDAL_COLORS = ["#FFC62E", "#D9DEE3", "#E08A4A"];

/** Lista de pontuadores no estilo do reveal — reaproveitada em reveal/scoreboard/game_over. */
export function ScorerList({ entries }: { entries: ScorerEntry[] }) {
  return (
    <div className={styles.list}>
      {entries.map((e, i) => (
        <div
          key={e.id ?? `${e.name}-${i}`}
          className={`${styles.row} ${i === 0 ? styles.rowFirst : ""}`}
          style={{ animationDelay: `${(i * 0.1).toFixed(2)}s` }}
        >
          <div className={styles.rank}>
            {i < 3 ? (
              <MedalIcon size={27} color={MEDAL_COLORS[i]} />
            ) : i === 3 ? (
              <StarIcon size={24} />
            ) : (
              <span className={styles.rankNum}>#{i + 1}</span>
            )}
          </div>
          <div className={styles.avatar}>
            <Avatar kind={(e.avatar as AvatarKind) || "fox"} />
          </div>
          <div className={styles.name}>{e.name}</div>
          <div className={styles.score}>{e.score}</div>
        </div>
      ))}
    </div>
  );
}
