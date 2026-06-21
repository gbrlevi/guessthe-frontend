import type { AvatarKind } from "../constants/avatars";
import { useCountUp } from "../hooks/useCountUp";
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

function ScorerRow({
  entry,
  index,
  isMine,
  celebrate,
}: {
  entry: ScorerEntry;
  index: number;
  isMine: boolean;
  celebrate: boolean;
}) {
  // pontuação "rola" incrementando de forma animada (efeito de revelação)
  const displayScore = useCountUp(entry.score);
  const cls = [
    styles.row,
    index === 0 ? styles.rowFirst : "",
    isMine ? styles.rowMine : "",
    isMine && celebrate ? styles.rowFlash : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={cls} style={{ animationDelay: `${(index * 0.1).toFixed(2)}s` }}>
      <div className={styles.rank}>
        {index < 3 ? (
          <MedalIcon size={27} color={MEDAL_COLORS[index]} />
        ) : index === 3 ? (
          <StarIcon size={24} />
        ) : (
          <span className={styles.rankNum}>#{index + 1}</span>
        )}
      </div>
      <div className={styles.avatar}>
        <Avatar kind={(entry.avatar as AvatarKind) || "fox"} />
      </div>
      <div className={styles.name}>{entry.name}</div>
      <div className={styles.score}>{displayScore}</div>
    </div>
  );
}

/**
 * Lista de pontuadores no estilo do reveal — reaproveitada em reveal/scoreboard/game_over.
 * `myId` destaca a linha do jogador local; `celebrateMine` adiciona o flash
 * dourado/verde de acerto (usado no reveal quando o jogador pontuou).
 */
export function ScorerList({
  entries,
  myId,
  celebrateMine = false,
}: {
  entries: ScorerEntry[];
  myId?: string | null;
  celebrateMine?: boolean;
}) {
  return (
    <div className={styles.list}>
      {entries.map((e, i) => (
        <ScorerRow
          key={e.id ?? `${e.name}-${i}`}
          entry={e}
          index={i}
          isMine={!!myId && e.id === myId}
          celebrate={celebrateMine}
        />
      ))}
    </div>
  );
}
