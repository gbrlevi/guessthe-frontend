import { AnswerInput } from "../components/AnswerInput";
import { AudioReveal } from "../components/AudioReveal";
import { PixelImage } from "../components/PixelImage";
import { Scoreboard } from "../components/Scoreboard";
import { Timer } from "../components/Timer";
import { VideoReveal } from "../components/VideoReveal";
import { getCategoryMeta } from "../constants/categoryMeta";
import { useGame } from "../context/GameContext";
import type { MediaPayload } from "../types/messages";

function MediaView({ media, revealed }: { media: MediaPayload | null; revealed: boolean }) {
  if (!media) return null;
  if (media.kind === "image" && media.url)
    return <PixelImage src={media.url} revealed={revealed} />;
  if (media.kind === "audio" && media.url)
    return <AudioReveal src={media.url} />;
  if (media.kind === "video" && media.url)
    return <VideoReveal src={media.url} />;
  if (media.kind === "text") {
    return (
      <ul className="clues">
        {(media.clues ?? []).map((c, i) => (
          <li key={i}>{c}</li>
        ))}
      </ul>
    );
  }
  return null;
}

export function Game() {
  const {
    phase, round, totalRounds, category, media, timeLeft, duration,
    revealAnswer, ranking, isHost, backToLobby,
  } = useGame();

  const meta = getCategoryMeta(category);

  if (phase === "starting") {
    return <div className="game center">A partida vai começar…</div>;
  }

  if (phase === "scoreboard") {
    return (
      <div className="game center">
        <Scoreboard ranking={ranking} title={`Placar — round ${round}/${totalRounds}`} />
        <p className="hint">Próximo round em instantes…</p>
      </div>
    );
  }

  if (phase === "game_over") {
    return (
      <div className="game center">
        <Scoreboard ranking={ranking} title="🏆 Fim de jogo!" />
        {isHost && <button onClick={backToLobby}>Voltar ao lobby</button>}
      </div>
    );
  }

  // phase === "question" | "reveal"
  const revealed = phase === "reveal";
  return (
    <div className="game">
      <header className="game-header">
        <span className="category">
          {meta.icon} {meta.label}
        </span>
        <span className="round">
          {round}/{totalRounds}
        </span>
      </header>

      {!revealed && (
        <>
          <Timer timeLeft={timeLeft} duration={duration} />
          <p className="media-hint">{meta.mediaHint}</p>
        </>
      )}

      <div className="media-area">
        <MediaView media={media} revealed={revealed} />
      </div>

      {revealed ? (
        <div className="reveal-answer">
          Resposta: <strong>{revealAnswer}</strong>
        </div>
      ) : (
        <AnswerInput />
      )}
    </div>
  );
}
