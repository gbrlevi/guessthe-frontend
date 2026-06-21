import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { useGame } from "../context/GameContext";
import styles from "./AnswerInput.module.css";

const API = import.meta.env.VITE_API_URL;

export function AnswerInput() {
  const { submitAnswer, answered, submitting, answerResult, closeAnswer, autocompleteEnabled, category, timeLeft } =
    useGame();
  const [guess, setGuess] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1); // sugestão destacada (teclado)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Refs atualizados a cada render para que o cleanup de unmount leia valores atuais
  const guessRef = useRef("");
  const submitRef = useRef(submitAnswer);
  guessRef.current = guess;
  submitRef.current = submitAnswer;

  // Ao desmontar (round acabou), envia o texto pendente como resposta final
  useEffect(() => {
    return () => {
      const g = guessRef.current.trim();
      if (g) submitRef.current(g); // submitAnswer já guarda contra answered/submitting
    };
  }, []);

  // busca sugestões com debounce
  useEffect(() => {
    clearTimeout(debounceRef.current);
    if (!autocompleteEnabled || guess.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      try {
        const r = await fetch(
          `${API}/autocomplete?category=${encodeURIComponent(category)}&q=${encodeURIComponent(guess)}`,
        );
        const data: string[] = await r.json();
        setSuggestions(data);
        setShowSuggestions(data.length > 0);
        setActiveIndex(-1); // reseta o destaque a cada nova lista
      } catch {
        setSuggestions([]);
      }
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [guess, category, autocompleteEnabled]);

  // fecha o dropdown ao clicar fora
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Escolher uma sugestão = enviá-la imediatamente (quiz de velocidade).
  const chooseSuggestion = (s: string) => {
    setShowSuggestions(false);
    setActiveIndex(-1);
    setGuess("");
    submitAnswer(s);
  };

  // Navegação por teclado no dropdown: ↑/↓ percorre, Enter escolhe, Esc fecha.
  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (i - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault(); // impede o submit do form: enviamos a sugestão destacada
      chooseSuggestion(suggestions[activeIndex]);
    } else if (e.key === "Escape") {
      e.preventDefault();
      setShowSuggestions(false);
      setActiveIndex(-1);
    }
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const g = guess.trim();
    if (!g || submitting) return;
    setShowSuggestions(false);
    setGuess("");
    submitAnswer(g);
  };

  // locked = acertou ou sem retry
  if (answered) {
    const feedbackClass = answerResult ? styles.correct : closeAnswer ? styles.close : styles.wrong;
    const feedbackMsg = answerResult
      ? "✅ Acertou! Aguardando fim do round…"
      : closeAnswer
      ? "Quase! Sua resposta estava próxima. Aguardando fim do round…"
      : "❌ Errou. Aguardando fim do round…";
    return (
      <div className={styles.bar}>
        <div className={`${styles.feedback} ${feedbackClass}`} role="status" aria-live="polite">
          {feedbackMsg}
        </div>
      </div>
    );
  }

  const showAutoHint = guess.trim().length > 0 && timeLeft != null && timeLeft <= 5;
  const showCloseHint = closeAnswer && !showSuggestions && !showAutoHint;

  return (
    <form className={styles.bar} onSubmit={onSubmit}>
      <div className={styles.inner}>
        <div className={styles.autocompleteWrap} ref={wrapperRef}>
          {showCloseHint && (
            <div className={styles.closeHint} role="status" aria-live="polite">
              Sua resposta está próxima!
            </div>
          )}
          {showAutoHint && (
            <div className={styles.autoHint} role="status" aria-live="polite">
              ⏳ Seu palpite atual será enviado ao acabar o tempo
            </div>
          )}
          <input
            className={styles.input}
            autoFocus
            value={guess}
            onChange={(e) => setGuess(e.target.value)}
            onKeyDown={onKeyDown}
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
            placeholder="Digite seu palpite e aperte Enter…"
            maxLength={60}
            disabled={submitting}
            autoComplete="off"
            role="combobox"
            aria-expanded={showSuggestions}
            aria-autocomplete="list"
            aria-activedescendant={activeIndex >= 0 ? `suggestion-${activeIndex}` : undefined}
          />
          {showSuggestions && (
            <ul className={styles.dropdown} role="listbox">
              {suggestions.map((s, i) => (
                <li
                  key={s}
                  id={`suggestion-${i}`}
                  role="option"
                  aria-selected={i === activeIndex}
                  className={i === activeIndex ? styles.activeItem : undefined}
                  onMouseEnter={() => setActiveIndex(i)}
                  onMouseDown={() => chooseSuggestion(s)}
                >
                  {s}
                </li>
              ))}
            </ul>
          )}
        </div>
        <button className={styles.sendBtn} type="submit" disabled={submitting}>
          {submitting ? "…" : "Enviar ➤"}
        </button>
      </div>
    </form>
  );
}
