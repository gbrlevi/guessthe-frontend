import { useEffect, useRef, useState } from "react";
import type { AvatarKind } from "../constants/avatars";
import { useGame } from "../context/GameContext";
import { Avatar } from "./Avatar";
import { MedalIcon } from "./icons";
import styles from "./TensionInterstitial.module.css";

const MEDAL_COLORS = ["#FFC62E", "#D9DEE3", "#E08A4A"];
const FADE_OUT_MS = 420;

/**
 * "A calmaria antes da tempestade" — overlay em tela cheia exibido no início do
 * Modo Tensão (últimos 30% das rodadas). Fundo preto fosco, texto piscando
 * agressivamente e um mini-placar do Top 3. Fica visível enquanto o servidor
 * segura o próximo `question_start` (ver GameContext / tension_intro); some via
 * fade-out quando a rodada de tensão começa.
 */
export function TensionInterstitial() {
  const { tensionIntro, tensionRanking } = useGame();
  const [render, setRender] = useState(tensionIntro);
  const [closing, setClosing] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (tensionIntro) {
      clearTimeout(closeTimer.current);
      setClosing(false);
      setRender(true);
    } else if (render) {
      // dispara fade-out e só remove do DOM ao fim da animação
      setClosing(true);
      closeTimer.current = setTimeout(() => setRender(false), FADE_OUT_MS);
    }
    return () => clearTimeout(closeTimer.current);
  }, [tensionIntro, render]);

  if (!render) return null;

  const top3 = tensionRanking.slice(0, 3);

  return (
    <div
      className={`${styles.overlay} ${closing ? styles.closing : ""}`}
      role="dialog"
      aria-live="assertive"
      aria-label="Rodadas finais — pontuação dobrada"
    >
      <div className={styles.inner}>
        <div className={styles.kicker}>⚠ ATENÇÃO ⚠</div>
        <h2 className={styles.headline}>
          RODADAS FINAIS:
          <br />
          PONTUAÇÃO DOBRADA!
        </h2>

        {top3.length > 0 && (
          <div className={styles.podium}>
            <div className={styles.podiumTitle}>TOP 3 AGORA</div>
            {top3.map((e, i) => (
              <div key={e.id ?? `${e.name}-${i}`} className={styles.podiumRow}>
                <div className={styles.podiumRank}>
                  <MedalIcon size={24} color={MEDAL_COLORS[i]} />
                </div>
                <div className={styles.podiumAvatar}>
                  <Avatar kind={(e.avatar as AvatarKind) || "fox"} />
                </div>
                <div className={styles.podiumName}>{e.name}</div>
                <div className={styles.podiumScore}>{e.score}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
