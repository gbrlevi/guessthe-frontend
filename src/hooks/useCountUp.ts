import { useEffect, useRef, useState } from "react";

/**
 * Anima um número inteiro até `target` (efeito de "rolagem" da pontuação).
 * Parte de 0 na montagem e, em mudanças posteriores de `target`, anima a partir
 * do valor atual. Usa requestAnimationFrame e cancela no unmount (sem leaks).
 */
export function useCountUp(target: number, durationMs = 900): number {
  const [value, setValue] = useState(0);
  const fromRef = useRef(0);
  const rafRef = useRef<number>();

  useEffect(() => {
    const from = fromRef.current;
    if (from === target) return;

    let start: number | null = null;
    const tick = (ts: number) => {
      if (start === null) start = ts;
      const t = Math.min(1, (ts - start) / durationMs);
      const eased = 1 - Math.pow(1 - t, 3); // ease-out cúbico
      const v = Math.round(from + (target - from) * eased);
      setValue(v);
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        fromRef.current = target;
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [target, durationMs]);

  return value;
}
