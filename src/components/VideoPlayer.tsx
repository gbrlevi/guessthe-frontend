import { useEffect, useRef, useState } from "react";
import { PlayIcon } from "./icons";
import styles from "./VideoPlayer.module.css";

const API = import.meta.env.VITE_API_URL;

/**
 * Player de vídeo Neubrutalista para o REVEAL. Esconde os controles nativos do
 * `<video>` (que destoam do design e variam por navegador) e gerencia a
 * reprodução via JS. O vídeo vem pelo proxy opaco (.webm via Range), já
 * pré-buscado durante o palpite → cache hit → toca instantâneo.
 *
 * Se o autoplay for bloqueado, um botão de Play sobreposto assume o controle.
 * Safari/iOS não decodifica webm → exibe aviso amigável.
 */
export function VideoPlayer({ src }: { src: string }) {
  const url = src.startsWith("http") ? src : `${API}${src}`;
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    setReady(false);
    setFailed(false);
    setPlaying(false);
    const el = videoRef.current;
    if (!el) return;
    el.load();
  }, [url]);

  const handleReady = () => {
    setReady(true);
    videoRef.current?.play().catch(() => {}); // bloqueado → overlay de Play
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
    </div>
  );
}
