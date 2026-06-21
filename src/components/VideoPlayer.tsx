import { useEffect, useRef, useState } from "react";
import { sfx } from "../lib/sfx";
import { PlayIcon } from "./icons";
import styles from "./VideoPlayer.module.css";

const API = import.meta.env.VITE_API_URL;

/**
 * Player de vídeo Neubrutalista para o REVEAL. Esconde os controles nativos do
 * `<video>` e gerencia reprodução via JS. Sincronizado com sfx.isMuted() para
 * que o botão global mute/desmute o vídeo também.
 */
export function VideoPlayer({ src }: { src: string }) {
  const url = src.startsWith("http") ? src : `${API}${src}`;
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [muted, setMuted] = useState(sfx.isMuted());

  // Sincroniza mute com o botão global de som
  useEffect(() => sfx.subscribe(setMuted), []);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    el.muted = muted;
  }, [muted]);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    el.volume = volume;
  }, [volume]);

  useEffect(() => {
    setReady(false);
    setFailed(false);
    setPlaying(false);
    const el = videoRef.current;
    if (!el) return;
    el.muted = sfx.isMuted();
    el.volume = volume;
    el.load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);

  const handleReady = () => {
    setReady(true);
    videoRef.current?.play().catch(() => {});
  };

  const togglePlay = () => {
    const el = videoRef.current;
    if (!el) return;
    if (el.paused) el.play().catch(() => {});
    else el.pause();
  };

  return (
    <div className={styles.wrap}>
      {failed ? (
        <div className={styles.caption}>🎬 Vídeo indisponível neste navegador</div>
      ) : (
        !ready && <div className={styles.caption}>Carregando vídeo…</div>
      )}
      <video
        ref={videoRef}
        src={url}
        autoPlay
        playsInline
        preload="auto"
        onClick={togglePlay}
        onCanPlayThrough={handleReady}
        onLoadedData={handleReady}
        onError={() => setFailed(true)}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        className={styles.video}
        style={{ display: ready && !failed ? "block" : "none" }}
      />
      {ready && !failed && !playing && (
        <button type="button" className={styles.overlayPlay} onClick={togglePlay} aria-label="Tocar vídeo">
          <PlayIcon size={40} />
        </button>
      )}
      {ready && !failed && (
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
      )}
    </div>
  );
}
