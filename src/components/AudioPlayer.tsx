import { useEffect, useRef, useState } from "react";
import { sfx } from "../lib/sfx";
import { PauseIcon, PlayIcon } from "./icons";
import styles from "./AudioPlayer.module.css";

const API = import.meta.env.VITE_API_URL;

/**
 * Player de áudio Neubrutalista. Substitui o `<audio controls>` nativo por:
 *  - um botão grande de Play/Pause estilizado;
 *  - uma barra de progresso NÃO interativa (sem seek) — essencial num quiz
 *    competitivo: o jogador não pode adiantar/atrasar a faixa para trapacear.
 *  - barra de volume interativa;
 *  - sincronização com sfx.isMuted() para que o botão global mute/desmute a música.
 * A faixa vem pelo proxy opaco do backend (URL camuflada).
 */
export function AudioPlayer({ src, autoPlay = true }: { src: string; autoPlay?: boolean }) {
  const url = src.startsWith("http") ? src : `${API}${src}`;
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0); // 0..1
  const [failed, setFailed] = useState(false);
  const [volume, setVolume] = useState(() => {
    try {
      const saved = localStorage.getItem("ldk-media-volume");
      return saved !== null ? Number(saved) : 0.8;
    } catch {
      return 0.8;
    }
  });
  const [muted, setMuted] = useState(sfx.isMuted());

  // Sincroniza mute com o botão global de som
  useEffect(() => sfx.subscribe(setMuted), []);

  // Aplica mute/volume ao elemento de áudio
  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    el.muted = muted;
  }, [muted]);

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    el.volume = volume;
  }, [volume]);

  useEffect(() => {
    try {
      localStorage.setItem("ldk-media-volume", String(volume));
    } catch {
      // ignore
    }
  }, [volume]);

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    setProgress(0);
    setFailed(false);
    el.muted = sfx.isMuted();
    el.volume = volume;
    el.load();
    if (autoPlay) el.play().catch(() => {});
  // volume deve mudar sem recarregar a faixa
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, autoPlay]);

  const toggle = () => {
    const el = audioRef.current;
    if (!el) return;
    if (el.paused) {
      if (el.ended) el.currentTime = 0;
      el.play().catch(() => {});
    } else {
      el.pause();
    }
  };

  return (
    <div className={styles.player}>
      <button
        type="button"
        className={styles.playBtn}
        onClick={toggle}
        aria-label={playing ? "Pausar áudio" : "Tocar áudio"}
      >
        {playing ? <PauseIcon size={26} /> : <PlayIcon size={26} />}
      </button>
      <div className={styles.trackWrap}>
        <div className={styles.track} role="progressbar" aria-valuenow={Math.round(progress * 100)} aria-valuemin={0} aria-valuemax={100}>
          <div className={styles.fill} style={{ width: `${progress * 100}%` }} />
        </div>
        <input
          className={styles.volumeSlider}
          type="range"
          min={0}
          max={1}
          step={0.05}
          value={muted ? 0 : volume}
          onChange={(e) => {
            const v = Number(e.target.value);
            setVolume(v);
            if (muted && v > 0) sfx.setMuted(false);
          }}
          aria-label="Volume"
          title="Volume"
        />
      </div>
      {failed && <div className={styles.error}>🔇 Áudio indisponível</div>}
      <audio
        ref={audioRef}
        src={url}
        preload="auto"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
        onError={() => {
          const el = audioRef.current;
          console.error("AudioPlayer: falha ao carregar/tocar áudio", url, el?.error);
          setFailed(true);
          setPlaying(false);
        }}
        onTimeUpdate={(e) => {
          const el = e.currentTarget;
          if (el.duration && isFinite(el.duration)) setProgress(el.currentTime / el.duration);
        }}
      />
    </div>
  );
}
