import { useCountdown } from "../hooks/useCountdown";
import styles from "./Timer.module.css";

/**
 * Cronômetro circular. Sincroniza com o `time_left` do servidor via useCountdown
 * (a fonte da verdade é o servidor; aqui só decrementa visualmente entre ticks).
 * Fica vermelho e pulsa mais rápido nos últimos 5s.
 */
export function Timer({ timeLeft, paused = false }: { timeLeft: number | null; paused?: boolean }) {
  const seconds = useCountdown(timeLeft, paused);
  const urgent = seconds <= 5;
  return (
    <div
      className={styles.timer}
      style={{
        background: urgent ? "#FF2D2D" : "#D6266F",
        animation: urgent ? "ldk-pulse .6s ease-in-out infinite" : "ldk-pulse 2s ease-in-out infinite",
      }}
    >
      <div className={styles.num}>{seconds}</div>
      <div className={styles.label}>SEGUNDOS</div>
    </div>
  );
}
