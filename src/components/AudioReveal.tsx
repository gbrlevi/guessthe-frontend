import { useEffect, useRef } from "react";

const API = import.meta.env.VITE_API_URL;

// Áudio pelo proxy opaco do backend (URL camuflada). load()+play() ao trocar a URL.
export function AudioReveal({ src }: { src: string }) {
  const url = src.startsWith("http") ? src : `${API}${src}`;
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    el.load();
    el.play().catch(() => {});
  }, [url]);

  return <audio ref={audioRef} src={url} controls style={{ width: "100%" }} />;
}
