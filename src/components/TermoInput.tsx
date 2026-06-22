import { useEffect, useRef, useState, type FormEvent } from "react";
import { useGame } from "../context/GameContext";
import styles from "./TermoInput.module.css";

/** Campo de palpite do Termo com bloqueio por cooldown e barra regressiva.
 *  O `draft` (linha em digitação) vive no Game.tsx para refletir na grade. */
export function TermoInput({
  draft,
  setDraft,
}: {
  draft: string;
  setDraft: (s: string) => void;
}) {
  const { submitGuess, wordLength, submissionCooldown, cooldownUntil, solved, attemptsLeft } = useGame();
  const [now, setNow] = useState(() => Date.now());
  const inputRef = useRef<HTMLInputElement>(null);
  const rafRef = useRef<number>();

  const remaining = cooldownUntil ? Math.max(0, cooldownUntil - now) : 0;
  const isCooldownActive = remaining > 0;

  // rAF roda só enquanto há cooldown ativo; para sozinho ao zerar.
  useEffect(() => {
    if (!cooldownUntil) return;
    const tick = () => {
      setNow(Date.now());
      if (Date.now() < cooldownUntil) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [cooldownUntil]);

  // Devolve o foco assim que o input volta a ser editável.
  useEffect(() => {
    if (!isCooldownActive) inputRef.current?.focus();
  }, [isCooldownActive]);

  // mantém só letras (o backend dobra acentos); limita ao tamanho da palavra
  const sanitize = (s: string) =>
    s.toUpperCase().replace(/[^A-ZÀ-Ý]/gi, "").slice(0, wordLength);

  const canSend = !isCooldownActive && !solved && attemptsLeft > 0 && draft.length === wordLength;

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!canSend) return;
    submitGuess(draft);
    setDraft("");
  };

  if (solved) {
    return (
      <div className={styles.bar}>
        <div className={`${styles.waiting} ${styles.waitingOk}`}>✓ Você acertou! Aguardando o fim da rodada…</div>
      </div>
    );
  }
  if (attemptsLeft <= 0) {
    return (
      <div className={styles.bar}>
        <div className={styles.waiting}>Tentativas esgotadas. Aguardando o fim da rodada…</div>
      </div>
    );
  }

  const pct =
    isCooldownActive && submissionCooldown > 0 ? (remaining / (submissionCooldown * 1000)) * 100 : 0;

  return (
    <form className={styles.bar} onSubmit={onSubmit}>
      <div className={styles.inner}>
        <div className={styles.field}>
          <input
            ref={inputRef}
            className={styles.input}
            value={draft}
            onChange={(e) => setDraft(sanitize(e.target.value))}
            placeholder={`Palavra de ${wordLength} letras…`}
            maxLength={wordLength}
            disabled={isCooldownActive}
            autoFocus
            autoComplete="off"
            aria-label="Seu palpite"
          />
          {isCooldownActive && (
            <div className={styles.cooldownTrack} aria-hidden="true">
              <div className={styles.cooldownFill} style={{ width: `${pct}%` }} />
            </div>
          )}
        </div>
        <button className={styles.sendBtn} type="submit" disabled={!canSend}>
          {isCooldownActive ? "Aguarde…" : "Enviar ➤"}
        </button>
      </div>
    </form>
  );
}
