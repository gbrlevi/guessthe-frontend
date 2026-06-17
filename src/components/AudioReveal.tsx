import { useEffect, useRef } from "react";

// recarrega e dá play sempre que a URL muda (servidor controla o tamanho do trecho)
export function AudioReveal({ src }: { src: string }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    el.load();
    el.play().catch(() => {});  // autoplay bloqueado até 1ª interação — ignorar
  }, [src]);

  return (
    <div className="media-frame audio">
      <span aria-hidden>🔊</span>
      <audio ref={audioRef} src={src} controls />
    </div>
  );
}
