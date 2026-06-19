import { useEffect, useRef, useState } from "react";

const API = import.meta.env.VITE_API_URL;

// Toca a abertura no reveal. O vídeo vem pelo proxy opaco do backend (.webm via Range),
// já pré-buscado durante o palpite → cache hit → toca instantâneo, sem delay.
// Exibido só quando pode tocar (evita pop-in). Safari/iOS não decodifica webm: mostra aviso.
export function VideoReveal({ src }: { src: string }) {
  const url = src.startsWith("http") ? src : `${API}${src}`;
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setReady(false);
    setFailed(false);
    const el = videoRef.current;
    if (!el) return;
    el.load();
  }, [url]);

  const handleReady = () => {
    setReady(true);
    videoRef.current?.play().catch(() => {});
  };

  return (
    <div className="media-frame video">
      {failed ? (
        <div className="media-loading">🎬 Vídeo indisponível neste navegador</div>
      ) : (
        !ready && <div className="media-loading">Carregando vídeo…</div>
      )}
      <video
        ref={videoRef}
        src={url}
        controls
        autoPlay
        playsInline
        preload="auto"
        onCanPlayThrough={handleReady}
        onLoadedData={handleReady}
        onError={() => setFailed(true)}
        style={{
          width: "100%",
          maxHeight: "360px",
          display: ready && !failed ? "block" : "none",
        }}
      />
    </div>
  );
}
