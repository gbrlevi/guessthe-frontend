/**
 * Gerenciador de TRILHAS MUSICAIS (música de fundo) — separado do `sfx.ts`,
 * que cuida só de efeitos pontuais sintetizados. Aqui carregamos arquivos reais
 * (`src/assets/*`) e controlamos as transições do jogo:
 *
 *  - `ambient_song.mp3` → rodadas normais (synthwave/chillwave, volume discreto);
 *  - `tension_song.mp3`  → rodadas finais (Modo Tensão, volume cheio);
 *  - silêncio              → perguntas de áudio/vídeo (não competir com a abertura
 *                            de anime tocando) e durante o interstício de tensão.
 *
 * Regras-chave (ver spec de UI/UX):
 *  - Toda troca de faixa faz FADE-OUT gradual de ~500ms (reduz `.volume` até 0
 *    antes de `.pause()`) para não cortar o som de forma abrupta.
 *  - O Modo Tensão acelera a faixa via `playbackRate` (1.0x → 1.5x) nos últimos
 *    10 segundos — exposto por `setRate`.
 *  - Respeita o mute global (`sfx`): o botão de som silencia também a música.
 *
 * É um singleton com elementos `<audio>` reaproveitados — sem React, então pode
 * ser chamado de qualquer lugar. A limpeza (parar tudo) é feita por `stop()`.
 */
import ambientUrl from "../assets/ambient_song.mp3";
import tensionUrl from "../assets/tension_song.mp3";
import { sfx } from "./sfx";

export type Track = "ambient" | "tension";

const FADE_MS = 500;
const FADE_STEP_MS = 25;
const MUSIC_VOLUME_KEY = "ldk-music-volume";

interface TrackConfig {
  url: string;
  volume: number; // volume nativo da faixa (multiplied by userVolume)
}

const TRACKS: Record<Track, TrackConfig> = {
  ambient: { url: ambientUrl, volume: 1.0 },
  tension: { url: tensionUrl, volume: 1.0 },
};

// Volume controlado pelo usuário (0–1). Padrão 30%; persistido em localStorage.
let userVolume = 0.3;
try {
  const stored = localStorage.getItem(MUSIC_VOLUME_KEY);
  if (stored !== null) userVolume = Math.min(1, Math.max(0, parseFloat(stored) || 0));
} catch {}

const elements = new Map<Track, HTMLAudioElement>();
const fadeTimers = new Map<Track, ReturnType<typeof setInterval>>();
let current: Track | null = null;
let muteUnsub: (() => void) | null = null;

function getElement(track: Track): HTMLAudioElement {
  let el = elements.get(track);
  if (!el) {
    el = new Audio(TRACKS[track].url);
    el.loop = true;
    el.volume = 0;
    el.preload = "auto";
    el.muted = sfx.isMuted();
    elements.set(track, el);
  }
  return el;
}

function clearFade(track: Track) {
  const t = fadeTimers.get(track);
  if (t) {
    clearInterval(t);
    fadeTimers.delete(track);
  }
}

/** Anima `el.volume` até `target` em ~`FADE_MS`; ao terminar chama `onDone`. */
function fade(track: Track, el: HTMLAudioElement, target: number, onDone?: () => void) {
  clearFade(track);
  const from = el.volume;
  const steps = Math.max(1, Math.round(FADE_MS / FADE_STEP_MS));
  const delta = (target - from) / steps;
  let i = 0;
  const timer = setInterval(() => {
    i += 1;
    const v = i >= steps ? target : from + delta * i;
    el.volume = Math.min(1, Math.max(0, v));
    if (i >= steps) {
      clearFade(track);
      onDone?.();
    }
  }, FADE_STEP_MS);
  fadeTimers.set(track, timer);
}

/** Garante que o mute global está espelhado em todos os elementos de áudio. */
function ensureMuteSync() {
  if (muteUnsub) return;
  muteUnsub = sfx.subscribe((m) => {
    for (const el of elements.values()) el.muted = m;
  });
}

export const music = {
  /**
   * Faixa de fundo desejada. Faz crossfade suave a partir da atual.
   * `null` = silêncio musical (fade-out da faixa atual e pausa).
   * Chamar com a faixa já tocando apenas reafirma volume/rate (não reinicia).
   */
  play(track: Track | null) {
    ensureMuteSync();

    if (track === current) {
      // Já é a faixa certa: só reidrata volume-alvo e velocidade normal.
      if (track) {
        const el = getElement(track);
        el.playbackRate = 1.0;
        if (el.paused) el.play().catch(() => {});
        fade(track, el, TRACKS[track].volume * userVolume);
      }
      return;
    }

    // Fade-out da faixa atual (pausa ao chegar a 0) antes de assumir a nova.
    const prev = current;
    if (prev) {
      const prevEl = getElement(prev);
      fade(prev, prevEl, 0, () => {
        prevEl.pause();
        prevEl.currentTime = 0;
        prevEl.playbackRate = 1.0;
      });
    }

    current = track;
    if (!track) return;

    const el = getElement(track);
    el.muted = sfx.isMuted();
    el.playbackRate = 1.0;
    el.volume = 0;
    el.play().catch(() => {
      /* autoplay bloqueado: ignora — religa no próximo gesto/estado */
    });
    fade(track, el, TRACKS[track].volume * userVolume);
  },

  /** Volume do usuário (0–1). Persiste em localStorage e aplica imediatamente. */
  setVolume(v: number) {
    userVolume = Math.min(1, Math.max(0, v));
    try { localStorage.setItem(MUSIC_VOLUME_KEY, String(userVolume)); } catch {}
    if (current) {
      const el = elements.get(current);
      if (el) fade(current, el, TRACKS[current].volume * userVolume);
    }
  },

  getVolume(): number {
    return userVolume;
  },

  /**
   * Acelera/normaliza a faixa atual (efeito de pânico do Modo Tensão).
   * `rate` esperado em [1.0, 1.5].
   */
  setRate(rate: number) {
    if (!current) return;
    const el = elements.get(current);
    if (el) el.playbackRate = Math.min(1.5, Math.max(0.5, rate));
  },

  /** Faixa de fundo tocando agora (ou null). */
  currentTrack(): Track | null {
    return current;
  },

  /** Para TODAS as faixas com fade-out e zera o estado (cleanup de partida). */
  stop() {
    const prev = current;
    current = null;
    if (prev) {
      const el = getElement(prev);
      fade(prev, el, 0, () => {
        el.pause();
        el.currentTime = 0;
        el.playbackRate = 1.0;
      });
    }
  },

  /** Descarte total (libera elementos/timers/inscrição de mute). */
  dispose() {
    for (const track of fadeTimers.keys()) clearFade(track);
    for (const el of elements.values()) {
      el.pause();
      el.src = "";
    }
    elements.clear();
    current = null;
    muteUnsub?.();
    muteUnsub = null;
  },
};
