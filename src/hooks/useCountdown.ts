import { useEffect, useRef, useState } from "react";

/**
 * Cronômetro APENAS visual. A fonte da verdade é o servidor: cada `reveal_update`
 * traz `time_left`, que reseta este contador. Entre ticks ele decrementa
 * localmente só para a barra/contagem parecer fluida.
 */
export function useCountdown(serverTimeLeft: number | null) {
  const [seconds, setSeconds] = useState(serverTimeLeft ?? 0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Sincroniza com o servidor sempre que chega um novo time_left.
  useEffect(() => {
    if (serverTimeLeft != null) setSeconds(serverTimeLeft);
  }, [serverTimeLeft]);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setSeconds((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return Math.max(0, seconds);
}
