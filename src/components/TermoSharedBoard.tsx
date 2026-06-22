import { useEffect, useRef, type CSSProperties } from "react";
import { Avatar } from "./Avatar";
import { TermoTile } from "./TermoTile";
import { useGame } from "../context/GameContext";
import type { AvatarKind } from "../constants/avatars";
import styles from "./TermoSharedBoard.module.css";

/** Abordagem B — Tabuleiro Compartilhado: um único tabuleiro central; cada
 *  `shared_grid_update` vira uma linha aberta com avatar/nome flutuando à
 *  esquerda. Auto-scroll mantém o foco na linha mais recente. */
export function TermoSharedBoard() {
  const { sharedRows, wordLength } = useGame();
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [sharedRows.length]);

  const colsVar = { "--cols": wordLength } as CSSProperties;
  const tileSize = wordLength > 8 ? "md" : "lg";

  return (
    <div className={styles.card}>
      <div className={styles.scroll}>
        {sharedRows.length === 0 && <div className={styles.empty}>Seja o primeiro a tentar! 🎯</div>}
        {sharedRows.map((s, i) => (
          <div key={i} className={styles.subRow}>
            <div className={styles.who}>
              <div className={styles.whoAvatar}>
                <Avatar kind={(s.avatar as AvatarKind) || "fox"} />
              </div>
              <span className={styles.whoName}>{s.player_name}</span>
            </div>
            <div className={styles.tiles} style={colsVar}>
              {s.letters.map((l, c) => (
                <TermoTile key={c} letter={l} state={s.colors[c]} size={tileSize} reveal delay={c * 60} />
              ))}
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>
    </div>
  );
}
