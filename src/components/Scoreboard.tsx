import type { RankEntry } from "../types/messages";
import { ScorerList } from "./ScorerList";
import styles from "./Scoreboard.module.css";

export function Scoreboard({ ranking, title }: { ranking: RankEntry[]; title: string }) {
  return (
    <div className={styles.card}>
      <h2 className={styles.title}>{title}</h2>
      <ScorerList entries={ranking} />
    </div>
  );
}
