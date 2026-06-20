import type { MediaPayload } from "../types/messages";
import { AudioReveal } from "./AudioReveal";
import { PixelImage } from "./PixelImage";
import { VideoReveal } from "./VideoReveal";
import styles from "./MediaArea.module.css";

const WAVE_BARS = Array.from({ length: 32 }, (_, i) => i);

/**
 * Renderiza a mídia da rodada dentro do frame neubrutalism, escolhendo o
 * visual por tipo. A lógica de QUAL elemento toca cada tipo é idêntica ao
 * MediaView original (preserva o comportamento já validado com o backend);
 * aqui só envolvemos no container estilizado do novo_design.
 */
export function MediaArea({ media, revealed }: { media: MediaPayload | null; revealed: boolean }) {
  if (!media) {
    return (
      <div className={styles.mediaBox}>
        <span className={styles.caption}>[ aguardando mídia… ]</span>
      </div>
    );
  }

  if (media.kind === "image" && media.url) {
    return (
      <div className={styles.mediaBox}>
        <PixelImage src={media.url} revealed={revealed} />
      </div>
    );
  }

  if (media.kind === "audio" && media.url) {
    return (
      <div className={styles.waveBox}>
        <div className={styles.waveBars}>
          {WAVE_BARS.map((i) => (
            <div key={i} className={styles.waveBar} style={{ animationDelay: `${(i * 0.055).toFixed(3)}s` }} />
          ))}
        </div>
        <AudioReveal src={media.url} />
        <span className={styles.caption}>
          {revealed ? "[ áudio revelado ]" : "[ reproduzindo · que som é esse? ]"}
        </span>
      </div>
    );
  }

  if (media.kind === "video" && media.url) {
    return (
      <div className={styles.mediaBox}>
        <VideoReveal src={media.url} />
      </div>
    );
  }

  if (media.kind === "text") {
    return (
      <div className={styles.plotList}>
        {(media.clues ?? []).map((c, i) => (
          <div key={i} className={styles.plotLine} style={{ animationDelay: `${(i * 0.09).toFixed(2)}s` }}>
            <div className={styles.plotNum}>{i + 1}</div>
            <div className={styles.plotText}>{c}</div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={styles.mediaBox}>
      <span className={styles.caption}>[ sem mídia ]</span>
    </div>
  );
}
