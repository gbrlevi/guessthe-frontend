import { useEffect, useRef, useState } from "react";
import { AnswerInput } from "../components/AnswerInput";
import { Avatar } from "../components/Avatar";
import { CatIcon } from "../components/CatIcon";
import { Confetti } from "../components/Confetti";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { GuessFeed } from "../components/GuessFeed";
import { Leaderboard } from "../components/Leaderboard";
import { MediaArea } from "../components/MediaArea";
import { Scoreboard } from "../components/Scoreboard";
import { ScorerList } from "../components/ScorerList";
import { MusicVolume } from "../components/MusicVolume";
import { SoundToggle } from "../components/SoundToggle";
import { TensionInterstitial } from "../components/TensionInterstitial";
import { Timer } from "../components/Timer";
import { Vignette } from "../components/Vignette";
import type { AvatarKind } from "../constants/avatars";
import { CheckIcon, ExitIcon, SparkleIcon } from "../components/icons";
import { getCategoryMeta } from "../constants/categoryMeta";
import { useGame } from "../context/GameContext";
import { fireSideConfetti } from "../lib/confetti";
import { sfx } from "../lib/sfx";
import styles from "./Game.module.css";

// Janela de pânico do Modo Tensão: vinheta vermelha nos últimos 10s.
const PANIC_WINDOW = 10;

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
    myId,
    isHost,
    isTension,
    backToLobby,
    leaveRoom,
    paused,
    pauseRound,
    resumeRound,
  } = useGame();

  const meta = getCategoryMeta(category);
  const [showLeave, setShowLeave] = useState(false);

  // Resultado do jogador local nesta rodada (autoritativo do servidor).
  const myResult = revealResults.find((r) => r.id === myId);
  const myCorrect = !!myResult?.correct;

  // Confete lateral no acerto — dispara uma única vez por reveal.
  const confettiRoundRef = useRef<number | null>(null);
  useEffect(() => {
    if (phase === "reveal" && myCorrect && confettiRoundRef.current !== round) {
      confettiRoundRef.current = round;
      fireSideConfetti();
    }
  }, [phase, myCorrect, round]);

  // Vinheta de pânico: últimos PANIC_WINDOW segundos de uma rodada de tensão.
  const panic =
    phase === "question" && isTension && !paused && timeLeft != null && timeLeft <= PANIC_WINDOW;

  const exitBtn = (
    <button
      type="button"
      className={styles.exitBtn}
      onClick={() => {
        sfx.click();
        setShowLeave(true);
      }}
      title="Sair da partida"
      aria-label="Sair da partida"
    >
      <ExitIcon size={16} />
      Sair
    </button>
  );

  let body: JSX.Element;

  if (phase === "starting") {
    body = (
      <div className={styles.center}>
        <div className={styles.startingCard}>
          <span className={styles.startingEmoji}>🎬</span>
          A partida vai começar…
        </div>
        {/* Avatares "pulsam" no ritmo da percussão da intro (ldk-beat ~1s). */}
        {players.length > 0 && (
          <div className={styles.startingAvatars}>
            {players.map((p, i) => (
              <div
                key={p.id}
                className={styles.startingAvatar}
                style={{ animationDelay: `${(i * 0.08).toFixed(2)}s` }}
              >
                <Avatar kind={(p.avatar as AvatarKind) || "fox"} />
              </div>
            ))}
          </div>
        )}
      </div>
    );
  } else if (phase === "scoreboard") {
    body = (
      <div className={styles.center}>
        <Scoreboard ranking={ranking} title={`Placar — round ${round}/${totalRounds}`} />
        <div className={styles.nextChip}>Próximo round em instantes…</div>
      </div>
    );
  } else if (phase === "game_over") {
    body = (
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
  } else if (phase === "reveal") {
    const scorers = revealResults.filter((r) => r.score > 0).sort((a, b) => b.score - a.score);
    body = (
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

          {/* Veredito pessoal: acerto pisca dourado/verde; erro treme + borda vermelha. */}
          {myResult && (
            <div
              key={`verdict-${round}`}
              className={`${styles.myVerdict} ${myCorrect ? styles.myVerdictCorrect : styles.myVerdictWrong}`}
            >
              {myCorrect ? "✓ Você acertou!" : "✗ Não foi dessa vez"}
            </div>
          )}

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
                  <ScorerList entries={scorers} myId={myId} celebrateMine={myCorrect} />
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
  } else {
    // phase === "question" → Arena
    body = (
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
            <MusicVolume />
            <SoundToggle />
            {isHost && (
              <button
                className={styles.pauseBtn}
                onClick={paused ? resumeRound : pauseRound}
                title={paused ? "Retomar" : "Pausar"}
              >
                {paused ? "▶" : "⏸"}
              </button>
            )}
            {exitBtn}
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

  return (
    <>
      {body}
      {/* Em fases sem header próprio, mostra os controles flutuantes (som + sair). */}
      {phase !== "question" && (
        <div className={styles.topControls}>
          <MusicVolume />
          <SoundToggle />
          {exitBtn}
        </div>
      )}
      {/* Overlays globais do Modo Tensão (sobre qualquer fase). */}
      <Vignette active={panic} />
      <TensionInterstitial />
      <ConfirmDialog
        open={showLeave}
        title="Sair da partida?"
        message="Você perderá seu progresso e voltará à tela inicial."
        confirmLabel="Sair"
        cancelLabel="Continuar jogando"
        tone="danger"
        onConfirm={() => {
          setShowLeave(false);
          leaveRoom();
        }}
        onCancel={() => setShowLeave(false)}
      />
    </>
  );
}
