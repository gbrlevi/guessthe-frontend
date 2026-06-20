import { AnswerInput } from "../components/AnswerInput";
import { CatIcon } from "../components/CatIcon";
import { Confetti } from "../components/Confetti";
import { GuessFeed } from "../components/GuessFeed";
import { Leaderboard } from "../components/Leaderboard";
import { MediaArea } from "../components/MediaArea";
import { Scoreboard } from "../components/Scoreboard";
import { ScorerList } from "../components/ScorerList";
import { Timer } from "../components/Timer";
import { CheckIcon, SparkleIcon } from "../components/icons";
import { getCategoryMeta } from "../constants/categoryMeta";
import { useGame } from "../context/GameContext";
import styles from "./Game.module.css";

export function Game() {
  const {
    phase,
    round,
    totalRounds,
    category,
    media,
    timeLeft,
    revealAnswer,
    revealResults,
    ranking,
    players,
    isHost,
    backToLobby,
    paused,
    pauseRound,
    resumeRound,
  } = useGame();

  const meta = getCategoryMeta(category);

  if (phase === "starting") {
    return (
      <div className={styles.center}>
        <div className={styles.startingCard}>
          <span className={styles.startingEmoji}>🎬</span>
          A partida vai começar…
        </div>
      </div>
    );
  }

  if (phase === "scoreboard") {
    return (
      <div className={styles.center}>
        <Scoreboard ranking={ranking} title={`Placar — round ${round}/${totalRounds}`} />
        <div className={styles.nextChip}>Próximo round em instantes…</div>
      </div>
    );
  }

  if (phase === "game_over") {
    return (
      <div className={styles.center}>
        <Confetti />
        <Scoreboard ranking={ranking} title="🏆 Fim de jogo!" />
        {isHost && (
          <button className={styles.backBtn} onClick={backToLobby}>
            Voltar ao lobby
          </button>
        )}
      </div>
    );
  }

  if (phase === "reveal") {
    const scorers = revealResults.filter((r) => r.score > 0).sort((a, b) => b.score - a.score);
    return (
      <div className={styles.reveal}>
        <Confetti />
        <div className={styles.revealInner}>
          <div className={styles.revealBadgeWrap}>
            <span className={`${styles.revealBadgeCorner} ${styles.revealBadgeCornerLeft}`} />
            <span className={`${styles.revealBadgeCorner} ${styles.revealBadgeCornerRight}`} />
            <div className={styles.revealBadgeInner}>
              <CheckIcon size={26} />
              <span>RESPOSTA REVELADA!</span>
            </div>
          </div>

          <div className={styles.revealGrid}>
            <div className={styles.answerCard}>
              <div className={styles.answerMedia}>
                <MediaArea media={media} revealed={true} />
              </div>
              <div className={styles.answerInfo}>
                <div className={styles.answerLabel}>A resposta certa era</div>
                <div className={styles.answerText}>{revealAnswer}</div>
                <div className={styles.answerCat}>
                  <div className={styles.answerCatIcon}>
                    <CatIcon kind={meta.iconKind} />
                  </div>
                  {meta.label}
                </div>
              </div>
            </div>

            <div className={styles.scorersCard}>
              <div className={styles.scorersTitle}>
                <SparkleIcon size={24} />
                Quem pontuou
              </div>
              <div className={styles.scorersBody}>
                {scorers.length > 0 ? (
                  <ScorerList entries={scorers} />
                ) : (
                  <div className={styles.emptyScorers}>Ninguém pontuou desta vez 😅</div>
                )}
              </div>
              <div className={styles.nextChip}>Próximo round em instantes…</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // phase === "question" → Arena
  return (
    <div className={styles.arena}>
      {paused && (
        <div className={styles.pausedOverlay}>
          ⏸ Partida pausada
          {isHost && (
            <button className={styles.resumeBtn} onClick={resumeRound}>
              Retomar
            </button>
          )}
        </div>
      )}

      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.roundBadge}>
            <div className={styles.roundLabel}>Rodada</div>
            <div className={styles.roundValue}>
              {round}
              <span className={styles.roundTotal}>/{totalRounds}</span>
            </div>
          </div>
          <div className={styles.catBox}>
            <div className={styles.catBoxIcon}>
              <CatIcon kind={meta.iconKind} frame="#FFF1E0" />
            </div>
            <div>
              <div className={styles.catBoxKicker}>Categoria</div>
              <div className={styles.catBoxName}>{meta.label}</div>
            </div>
          </div>
        </div>

        <div className={styles.headerCenter}>
          <Timer timeLeft={timeLeft} paused={paused} />
        </div>

        <div className={styles.headerRight}>
          {isHost && (
            <button
              className={styles.pauseBtn}
              onClick={paused ? resumeRound : pauseRound}
              title={paused ? "Retomar" : "Pausar"}
            >
              {paused ? "▶" : "⏸"}
            </button>
          )}
        </div>
      </div>

      <div className={styles.main}>
        <div className={styles.mediaCard}>
          <div className={styles.mediaHeader}>
            <div className={styles.mediaHint}>{meta.mediaHint}</div>
            <div className={styles.liveBadge}>
              <span className={styles.liveDot} />
              AO VIVO
            </div>
          </div>
          <MediaArea media={media} revealed={false} />
        </div>

        <div className={styles.sidebar}>
          <Leaderboard players={players} />
          <GuessFeed />
        </div>
      </div>

      {!paused && <AnswerInput />}
    </div>
  );
}
