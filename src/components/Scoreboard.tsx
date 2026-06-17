import type { RankEntry } from "../types/messages";

export function Scoreboard({ ranking, title }: { ranking: RankEntry[]; title: string }) {
  return (
    <div className="scoreboard">
      <h2>{title}</h2>
      <ol>
        {ranking.map((r, i) => (
          <li key={`${r.name}-${i}`}>
            <span className="rank-pos">{i + 1}</span>
            <span className="rank-name">{r.name}</span>
            <span className="rank-score">{r.score}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
