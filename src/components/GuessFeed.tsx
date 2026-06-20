import type { AvatarKind } from "../constants/avatars";
import { Avatar } from "./Avatar";
import { ChatIcon } from "./icons";
import styles from "./GuessFeed.module.css";

/**
 * PLACEHOLDER — painel "Palpites".
 * O backend ainda NÃO transmite chat nem palpites de outros jogadores durante a
 * rodada (anti-cheat: envia só o resultado pessoal via answer_result). Mantemos
 * este painel mockado com o shape pronto para plugar num evento WS futuro.
 * TODO(backend): trocar MOCK_MESSAGES por mensagens reais quando o evento existir.
 */
interface FeedMsg {
  id: number;
  av: AvatarKind;
  name: string;
  text: string;
  type: "normal" | "close" | "correct";
}

const MOCK_MESSAGES: FeedMsg[] = [
  { id: 1, av: "panda", name: "Pandinha", text: "boa sorte galera kkk", type: "normal" },
  { id: 2, av: "lion", name: "LeoZera", text: "esse eu sei de cabeça", type: "normal" },
  { id: 3, av: "octopus", name: "Polvo", text: "friren?", type: "close" },
];

const STYLE: Record<FeedMsg["type"], { bg: string; border: string; fg: string; badge: string }> = {
  normal: { bg: "#FFF6EC", border: "#E2C4A4", fg: "#7A5230", badge: "" },
  close: { bg: "#FFF3C4", border: "#E0A500", fg: "#7A5A00", badge: "Quase!" },
  correct: { bg: "#DEF8E5", border: "#3FBF63", fg: "#1E6B38", badge: "Acertou!" },
};

export function GuessFeed() {
  return (
    <div className={styles.panel}>
      <div className={styles.title}>
        <ChatIcon size={20} />
        Palpites
      </div>
      <div className={styles.feed}>
        {MOCK_MESSAGES.map((m) => {
          const s = STYLE[m.type];
          return (
            <div key={m.id} className={styles.msg} style={{ background: s.bg, borderColor: s.border }}>
              <div className={styles.msgAvatar}>
                <Avatar kind={m.av} />
              </div>
              <div className={styles.msgBody}>
                <div className={styles.msgHead}>
                  <span className={styles.msgName} style={{ color: s.fg }}>
                    {m.name}
                  </span>
                  {s.badge && (
                    <span className={styles.msgBadge} style={{ background: s.border }}>
                      {s.badge}
                    </span>
                  )}
                </div>
                <div className={styles.msgText} style={{ color: s.fg }}>
                  {m.text}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className={styles.note}>Mock — chat em tempo real chega numa próxima versão do backend.</div>
    </div>
  );
}
