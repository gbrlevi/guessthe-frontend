import { useEffect, useRef, useState } from "react";

// Toca a abertura no reveal. O vídeo é o .webm cru do AnimeThemes (Range nativo do
// browser, sem Cloudinary). Exibido só quando pode tocar — evita pop-in/buffering.
// Safari/iOS não decodifica webm: nesse caso mostra um aviso em vez de travar.
export function VideoReveal({ src }: { src: string }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setReady(false);
    setFailed(false);
    const el = videoRef.current;
    if (!el) return;
    el.load();
  }, [src]);

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
        src={src}
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
