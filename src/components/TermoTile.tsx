import type { CSSProperties } from "react";
import type { LetterColor } from "../types/messages";
import palette from "./termoPalette.module.css";
import styles from "./TermoTile.module.css";

/** Tile de uma letra do Termo. A cor vem do servidor (nunca calculada no
 *  cliente); "empty"/"filled" são estados locais da linha ativa. */
export function TermoTile({
  letter,
  state,
  size = "lg",
  reveal,
  delay,
}: {
  letter?: string;
  state: LetterColor;
  size?: "lg" | "md";
  reveal?: boolean;
  delay?: number;
}) {
  const skin = palette[state] ?? palette.empty;
  const style: CSSProperties | undefined =
    reveal && delay ? { animationDelay: `${delay}ms` } : undefined;
  return (
    <div
      className={`${styles.tile} ${styles[size]} ${skin} ${reveal ? styles.reveal : ""}`}
      style={style}
    >
      {letter ?? ""}
    </div>
  );
}
