import { useEffect, useRef, useState, type FormEvent } from "react";
import { useGame } from "../context/GameContext";
import styles from "./AnswerInput.module.css";

const API = import.meta.env.VITE_API_URL;

export function AnswerInput() {
  const { submitAnswer, answered, submitting, answerResult, autocompleteEnabled, category } = useGame();
  const [guess, setGuess] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
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

  const pickSuggestion = (s: string) => {
    setGuess(s);
    setShowSuggestions(false);
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
    return (
      <div className={styles.bar}>
        <div className={`${styles.feedback} ${answerResult ? styles.correct : styles.wrong}`}>
          {answerResult ? "✅ Acertou! Aguardando fim do round…" : "❌ Errou. Aguardando fim do round…"}
        </div>
      </div>
    );
  }

  return (
    <form className={styles.bar} onSubmit={onSubmit}>
      <div className={styles.inner}>
        <div className={styles.autocompleteWrap} ref={wrapperRef}>
          {answerResult === false && !showSuggestions && (
            <div className={styles.inlineWrong}>❌ Errou! Tente novamente.</div>
          )}
          <input
            className={styles.input}
            autoFocus
            value={guess}
            onChange={(e) => setGuess(e.target.value)}
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
            placeholder="Digite seu palpite e aperte Enter…"
            maxLength={60}
            disabled={submitting}
            autoComplete="off"
          />
          {showSuggestions && (
            <ul className={styles.dropdown}>
              {suggestions.map((s) => (
                <li key={s} onMouseDown={() => pickSuggestion(s)}>
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
