import { useEffect, useState } from "react";
import { music } from "../lib/music";
import { sfx } from "../lib/sfx";
import styles from "./MusicVolume.module.css";

/** Controle deslizante de volume da trilha sonora, ao lado do botão de mute. */
export function MusicVolume() {
  const [volume, setVolume] = useState(() => music.getVolume());
  const [muted, setMuted] = useState(() => sfx.isMuted());

  useEffect(() => sfx.subscribe(setMuted), []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const v = Number(e.target.value) / 100;
    setVolume(v);
    music.setVolume(v);
  }

  return (
    <div className={`${styles.wrap} ${muted ? styles.disabled : ""}`} title={`Volume da música: ${Math.round(volume * 100)}%`}>
      <span className={styles.icon} aria-hidden="true">🎵</span>
      <input
        type="range"
        min="0"
        max="100"
        step="1"
        value={Math.round(volume * 100)}
        onChange={handleChange}
        disabled={muted}
        className={styles.slider}
        aria-label="Volume da música"
      />
      <span className={styles.label}>{Math.round(volume * 100)}%</span>
    </div>
  );
}
