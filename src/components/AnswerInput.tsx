import { useState, type FormEvent } from "react";
import { useGame } from "../context/GameContext";

/** Campo de palpite. Após enviar, trava e mostra o booleano vindo do servidor. */
export function AnswerInput() {
  const { submitAnswer, answered, answerResult } = useGame();
  const [guess, setGuess] = useState("");

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const g = guess.trim();
    if (!g || answered) return;
    submitAnswer(g);
  };

  if (answered) {
    return (
      <div className={`answer-feedback ${answerResult ? "correct" : "wrong"}`}>
        {answerResult == null
          ? "Resposta enviada…"
          : answerResult
            ? "✅ Acertou! Aguarde o fim do round."
            : "❌ Errou. Aguarde o fim do round."}
      </div>
    );
  }

  return (
    <form className="answer-input" onSubmit={onSubmit}>
      <input
        autoFocus
        value={guess}
        onChange={(e) => setGuess(e.target.value)}
        placeholder="Seu palpite…"
        maxLength={60}
      />
      <button type="submit">Responder</button>
    </form>
  );
}
