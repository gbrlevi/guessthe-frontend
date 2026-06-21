import { useEffect, useState } from "react";
import { sfx } from "../lib/sfx";
import { SoundOffIcon, SoundOnIcon } from "./icons";
import styles from "./SoundToggle.module.css";

/** Botão de liga/desliga do som. Estado sincronizado com o módulo sfx (localStorage). */
export function SoundToggle({ className }: { className?: string }) {
  const [muted, setMuted] = useState(sfx.isMuted());

  useEffect(() => sfx.subscribe(setMuted), []);

  return (
    <button
      type="button"
      className={`${styles.btn} ${className ?? ""}`}
      onClick={() => sfx.toggle()}
      title={muted ? "Ativar sons" : "Silenciar sons"}
      aria-label={muted ? "Ativar sons" : "Silenciar sons"}
      aria-pressed={muted}
    >
      {muted ? <SoundOffIcon size={18} /> : <SoundOnIcon size={18} />}
    </button>
  );
}
