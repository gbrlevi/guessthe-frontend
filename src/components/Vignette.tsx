import styles from "./Vignette.module.css";

/**
 * Vinheta de PÂNICO — borda avermelhada que pulsa nas bordas da tela durante os
 * últimos 10 segundos de uma rodada do Modo Tensão. É puramente decorativa:
 * `pointer-events: none` para nunca bloquear cliques/inputs.
 */
export function Vignette({ active }: { active: boolean }) {
  if (!active) return null;
  return <div className={styles.vignette} aria-hidden="true" />;
}
