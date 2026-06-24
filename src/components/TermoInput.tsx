import { useEffect, useRef, useState, useMemo, type FormEvent } from "react";
import { useGame } from "../context/GameContext";
import { TermoTile } from "./TermoTile";
import palette from "./termoPalette.module.css";
import styles from "./TermoInput.module.css";
import type { LetterColor } from "../types/messages";

// Backspace Icon SVG inline
function BackspaceIcon({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ display: "block" }}
    >
      <path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0 -2-2z" />
      <line x1="18" y1="9" x2="12" y2="15" />
      <line x1="12" y1="9" x2="18" y2="15" />
    </svg>
  );
}

/** Campo de palpite do Termo com bloqueio por cooldown e barra regressiva.
 *  O `draft` (linha em digitação) vive no Game.tsx para refletir na grade.
 *  Agora com entrada por teclas (Wordle-like) física e virtual. */
export function TermoInput({
  draft,
  setDraft,
}: {
  draft: string;
  setDraft: (s: string) => void;
}) {
  const {
    submitGuess,
    wordLength,
    submissionCooldown,
    cooldownUntil,
    solved,
    attemptsLeft,
    termoMode,
    myRows,
    sharedRows,
  } = useGame();

  const [now, setNow] = useState(() => Date.now());
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

  // mantém só letras (o backend dobra acentos); limita ao tamanho da palavra
  const sanitize = (s: string) =>
    s.toUpperCase().replace(/[^A-ZÀ-Ý]/gi, "").slice(0, wordLength);

  const canSend = !isCooldownActive && !solved && attemptsLeft > 0 && draft.length === wordLength;

  // Handlers para digitação e envio
  const handleKeyInput = (char: string) => {
    if (isCooldownActive || solved || attemptsLeft <= 0) return;
    if (draft.length < wordLength) {
      setDraft(sanitize(draft + char));
    }
  };

  const handleBackspace = () => {
    if (isCooldownActive || solved || attemptsLeft <= 0) return;
    setDraft(draft.slice(0, -1));
  };

  const handleEnter = () => {
    if (!canSend) return;
    submitGuess(draft);
    setDraft("");
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    handleEnter();
  };

  // Captura teclado físico
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignora se o foco estiver em algum elemento de input/textarea
      const activeEl = document.activeElement;
      if (
        activeEl &&
        (activeEl.tagName === "INPUT" ||
          activeEl.tagName === "TEXTAREA" ||
          activeEl.getAttribute("contenteditable") === "true")
      ) {
        return;
      }

      // Ignora teclas modificadoras
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      const key = e.key.toUpperCase();

      if (key === "ENTER") {
        e.preventDefault();
        handleEnter();
      } else if (key === "BACKSPACE") {
        e.preventDefault();
        handleBackspace();
      } else if (/^[A-ZÀ-Ý]$/i.test(key)) {
        e.preventDefault();
        handleKeyInput(key);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [draft, wordLength, canSend, isCooldownActive, solved, attemptsLeft]);

  // Mapeia letras tentadas para cores
  const letterStatuses = useMemo(() => {
    const statuses: Record<string, "correct" | "present" | "absent"> = {};

    const processRow = (letters: string[], colors: LetterColor[]) => {
      letters.forEach((char, idx) => {
        if (!char) return;
        const uChar = char.toUpperCase();
        const color = colors[idx];
        if (color === "correct") {
          statuses[uChar] = "correct";
        } else if (color === "present") {
          if (statuses[uChar] !== "correct") {
            statuses[uChar] = "present";
          }
        } else if (color === "absent") {
          if (statuses[uChar] !== "correct" && statuses[uChar] !== "present") {
            statuses[uChar] = "absent";
          }
        }
      });
    };

    if (termoMode === "pvp_individual") {
      myRows.forEach((row) => {
        processRow(row.letters, row.colors);
      });
    } else {
      sharedRows.forEach((row) => {
        processRow(row.letters, row.colors);
      });
    }

    return statuses;
  }, [myRows, sharedRows, termoMode]);

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

  // Definição das linhas do teclado virtual
  const keyboardRows = [
    ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
    ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
    ["ENTER", "Z", "X", "C", "V", "B", "N", "M", "BACKSPACE"],
  ];

  return (
    <form className={styles.bar} onSubmit={onSubmit}>
      <div className={styles.inner}>
        {/* Rascunho de letras para Tabuleiro Compartilhado */}
        {termoMode === "tabuleiro_compartilhado" && (
          <div className={styles.draftRow}>
            {Array.from({ length: wordLength }).map((_, i) => (
              <TermoTile
                key={i}
                letter={draft[i]}
                state={draft[i] ? "filled" : "empty"}
                size={wordLength > 8 ? "md" : "lg"}
              />
            ))}
          </div>
        )}

        {/* Cooldown bar (sempre renderizado para reservar o espaço) */}
        <div 
          className={styles.cooldownContainer} 
          style={{ 
            opacity: isCooldownActive ? 1 : 0, 
            pointerEvents: "none",
            transition: "opacity 0.2s" 
          }}
        >
          <div className={styles.cooldownTrack} aria-hidden="true">
            <div className={styles.cooldownFill} style={{ width: `${pct}%` }} />
          </div>
        </div>

        {/* Teclado Virtual */}
        <div className={styles.keyboard}>
          {keyboardRows.map((row, rowIndex) => (
            <div key={rowIndex} className={styles.row}>
              {row.map((key) => {
                const isSpecial = key === "ENTER" || key === "BACKSPACE";
                const status = letterStatuses[key];
                const statusClass = status ? palette[status] : styles.keyEmpty;

                let label: React.ReactNode = key;
                if (key === "BACKSPACE") {
                  label = <BackspaceIcon size={18} />;
                } else if (key === "ENTER") {
                  label = "ENTER";
                }

                const handleClick = () => {
                  if (key === "ENTER") {
                    handleEnter();
                  } else if (key === "BACKSPACE") {
                    handleBackspace();
                  } else {
                    handleKeyInput(key);
                  }
                };

                return (
                  <button
                    key={key}
                    type="button"
                    className={`${styles.key} ${isSpecial ? styles.specialKey : ""} ${statusClass}`}
                    onClick={handleClick}
                    disabled={isCooldownActive}
                    aria-label={
                      key === "BACKSPACE"
                        ? "Apagar letra"
                        : key === "ENTER"
                        ? "Enviar palavra"
                        : `Letra ${key}`
                    }
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </form>
  );
}
