import { useEffect, useRef } from "react";
import type { AvatarKind } from "../constants/avatars";
import { useGame } from "../context/GameContext";
import type { ChatMessage } from "../types/messages";
import { Avatar } from "./Avatar";
import { ChatIcon } from "./icons";
import styles from "./GuessFeed.module.css";

const STYLE: Record<ChatMessage["msg_type"], { bg: string; border: string; fg: string; badge: string }> = {
  guess: { bg: "#FFF6EC", border: "#E2C4A4", fg: "#7A5230", badge: "" },
  correct: { bg: "#DEF8E5", border: "#3FBF63", fg: "#1E6B38", badge: "Acertou!" },
};

export function GuessFeed() {
  const { chatMessages, players } = useGame();
  const feedRef = useRef<HTMLDivElement>(null);

  // auto-scroll para o último palpite
  useEffect(() => {
    const el = feedRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [chatMessages]);

  return (
    <div className={styles.panel}>
      <div className={styles.title}>
        <ChatIcon size={20} />
        Palpites
        {players.length > 0 && (
          <span className={styles.playerCount}>{players.length} jogador{players.length !== 1 ? "es" : ""}</span>
        )}
      </div>
      <div className={styles.feed} ref={feedRef}>
        {chatMessages.length === 0 && (
          <div className={styles.empty}>Aguardando palpites…</div>
        )}
        {chatMessages.map((m, i) => {
          const s = STYLE[m.msg_type];
          return (
            <div
              key={`${m.player_id}-${i}`}
              className={styles.msg}
              style={{ background: s.bg, borderColor: s.border }}
            >
              <div className={styles.msgAvatar}>
                <Avatar kind={(m.avatar as AvatarKind) || "fox"} />
              </div>
              <div className={styles.msgBody}>
                <div className={styles.msgHead}>
                  <span className={styles.msgName} style={{ color: s.fg }}>
                    {m.player_name}
                  </span>
                  {s.badge && (
                    <span className={styles.msgBadge} style={{ background: s.border }}>
                      {s.badge}
                    </span>
                  )}
                </div>
                <div className={styles.msgText} style={{ color: s.fg }}>
                  {m.msg_type === "correct" ? "Acertou a resposta! 🎉" : m.text}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
