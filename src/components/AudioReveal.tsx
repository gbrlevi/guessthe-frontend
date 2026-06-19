import { useEffect, useRef } from "react";

const API = import.meta.env.VITE_API_URL;

export function AudioReveal({ src }: { src: string }) {
  const url = src.startsWith("http") ? src : `${API}${src}`;
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    el.load();
    el.play().catch(() => {});
  }, [url]);

  return (
    <div className="media-frame audio">
      <span aria-hidden>🔊</span>
      <audio ref={audioRef} src={url} controls />
    </div>
  );
}
