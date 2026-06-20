import { useMemo } from "react";
import styles from "./Confetti.module.css";

const PALETTE = ["#FFC62E", "#FF5436", "#3FBF63", "#D6266F", "#FF9E45", "#FFE08A"];

/** Confete decorativo (ldk-fall). Gerado uma vez por montagem. */
export function Confetti({ count = 70 }: { count?: number }) {
  const pieces = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: `${Math.round(Math.random() * 100)}%`,
        bg: PALETTE[i % PALETTE.length],
        delay: `${(Math.random() * 2.6).toFixed(2)}s`,
        dur: `${(2.2 + Math.random() * 1.8).toFixed(2)}s`,
        size: `${(9 + Math.random() * 12).toFixed(0)}px`,
      })),
    [count],
  );
  return (
    <div className={styles.layer}>
      {pieces.map((c) => (
        <div
          key={c.id}
          className={styles.piece}
          style={{
            left: c.left,
            width: c.size,
            height: c.size,
            background: c.bg,
            animation: `ldk-fall ${c.dur} linear ${c.delay} infinite`,
          }}
        />
      ))}
    </div>
  );
}
