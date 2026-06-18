import { useCountdown } from "../hooks/useCountdown";

/** Barra/contagem visual. Sincroniza com o `time_left` do servidor. */
export function Timer({ timeLeft, duration, paused = false }: { timeLeft: number | null; duration: number; paused?: boolean }) {
  const seconds = useCountdown(timeLeft, paused);
  const pct = duration > 0 ? Math.max(0, Math.min(100, (seconds / duration) * 100)) : 0;
  return (
    <div className="timer">
      <div className="timer-bar" style={{ width: `${pct}%` }} />
      <span className="timer-label">{seconds}s</span>
    </div>
  );
}
