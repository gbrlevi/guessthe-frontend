import { useEffect, useRef, type CSSProperties } from "react";
import { Avatar } from "./Avatar";
import { TermoTile } from "./TermoTile";
import { useGame } from "../context/GameContext";
import { fireSideConfetti } from "../lib/confetti";
import type { AvatarKind } from "../constants/avatars";
import type { LetterColor } from "../types/messages";
import palette from "./termoPalette.module.css";
import styles from "./TermoBoardPvp.module.css";

/** Abordagem A — PvP Individual: grade própria centralizada + mini-grids
 *  censurados (só blocos de cor 8×8) de cada rival na lateral. */
export function TermoBoardPvp({ draft }: { draft: string }) {
  const { wordLength, maxAttempts, myRows, solved, opponentProgress, players, myId } = useGame();

  // Confete uma vez ao resolver (reseta quando a rodada reinicia → solved=false).
  const firedRef = useRef(false);
  useEffect(() => {
    if (solved && !firedRef.current) {
      firedRef.current = true;
      fireSideConfetti();
    }
    if (!solved) firedRef.current = false;
  }, [solved]);

  const activeRow = myRows.length;
  const opponents = players.filter((p) => p.id !== myId);
  const colsVar = { "--cols": wordLength } as CSSProperties;
  const tileSize = wordLength > 8 ? "md" : "lg";

  return (
    <div className={styles.wrap}>
      <div className={styles.boardCol}>
        <div className={styles.grid} style={colsVar}>
          {Array.from({ length: maxAttempts }).flatMap((_, r) => {
            const row = myRows[r];
            const isActive = r === activeRow && !solved;
            return Array.from({ length: wordLength }).map((__, c) => {
              if (row) {
                return (
                  <TermoTile key={`${r}-${c}`} letter={row.letters[c]} state={row.colors[c]} size={tileSize} reveal delay={c * 80} />
                );
              }
              if (isActive) {
                return <TermoTile key={`${r}-${c}`} letter={draft[c]} state={draft[c] ? "filled" : "empty"} size={tileSize} />;
              }
              return <TermoTile key={`${r}-${c}`} state="empty" size={tileSize} />;
            });
          })}
        </div>
      </div>

      {opponents.length > 0 && (
        <aside className={styles.oppPanel}>
          <div className={styles.oppTitle}>Rivais</div>
          {opponents.map((p) => {
            const rows = opponentProgress[p.id] ?? [];
            return (
              <div key={p.id} className={styles.oppCard}>
                <div className={styles.oppHead}>
                  <div className={styles.oppAvatar}>
                    <Avatar kind={(p.avatar as AvatarKind) || "fox"} />
                  </div>
                  <span className={styles.oppName}>{p.name}</span>
                </div>
                <div className={styles.oppGrid} style={colsVar}>
                  {Array.from({ length: maxAttempts }).flatMap((_, r) =>
                    Array.from({ length: wordLength }).map((__, c) => {
                      const color = rows[r]?.[c] as LetterColor | undefined;
                      return (
                        <span key={`${r}-${c}`} className={`${styles.block} ${color ? palette[color] : palette.empty}`} />
                      );
                    }),
                  )}
                </div>
              </div>
            );
          })}
        </aside>
      )}
    </div>
  );
}
