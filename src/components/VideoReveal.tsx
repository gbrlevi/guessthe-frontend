import { useEffect, useRef } from "react";

// toca o webm da abertura automaticamente no reveal
export function VideoReveal({ src }: { src: string }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    el.load();
    el.play().catch(() => {});
  }, [src]);

  return (
    <div className="media-frame video">
      <video ref={videoRef} src={src} controls autoPlay style={{ width: "100%", maxHeight: "360px" }} />
    </div>
  );
}
