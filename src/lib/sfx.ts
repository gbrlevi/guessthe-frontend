/**
 * Efeitos sonoros sintetizados via Web Audio API — sem arquivos de áudio.
 * Tudo é gerado por osciladores em runtime, então não há assets para carregar
 * nem licenças a gerir. O AudioContext só é criado/retomado após um gesto do
 * usuário (clique), respeitando a política de autoplay dos navegadores.
 *
 * O mute é persistido em localStorage e compartilhado entre os componentes.
 */

const STORAGE_KEY = "ldk-muted";

let ctx: AudioContext | null = null;
let muted = readMuted();
const listeners = new Set<(muted: boolean) => void>();

function readMuted(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const Ctor = window.AudioContext || (window as any).webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
  }
  // Navegadores suspendem o contexto até um gesto; retomamos sob demanda.
  if (ctx.state === "suspended") ctx.resume().catch(() => {});
  return ctx;
}

interface ToneOpts {
  freq: number;
  duration: number;
  type?: OscillatorType;
  gain?: number;
  delay?: number;
  slideTo?: number; // glissando até esta frequência ao fim da nota
}

function tone({ freq, duration, type = "sine", gain = 0.18, delay = 0, slideTo }: ToneOpts) {
  const ac = getCtx();
  if (!ac) return;
  const t0 = ac.currentTime + delay;
  const osc = ac.createOscillator();
  const g = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + duration);
  // envelope ataque/decay curtos para um "pop" cartoon sem cliques
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(gain, t0 + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
  osc.connect(g).connect(ac.destination);
  osc.start(t0);
  osc.stop(t0 + duration + 0.02);
}

/** Sequência de notas (para arpejos de acerto/fanfarra). */
function sequence(notes: Array<{ freq: number; at: number; dur?: number; gain?: number }>, type: OscillatorType = "triangle") {
  for (const n of notes) tone({ freq: n.freq, duration: n.dur ?? 0.16, type, gain: n.gain ?? 0.2, delay: n.at });
}

export const sfx = {
  isMuted: () => muted,
  setMuted(value: boolean) {
    muted = value;
    try {
      localStorage.setItem(STORAGE_KEY, value ? "1" : "0");
    } catch {
      /* storage indisponível */
    }
    listeners.forEach((l) => l(value));
  },
  toggle() {
    this.setMuted(!muted);
    if (!muted) this.click(); // confirma audivelmente ao religar
  },
  subscribe(fn: (muted: boolean) => void) {
    listeners.add(fn);
    return () => {
      listeners.delete(fn);
    };
  },

  /** Clique físico de botão. */
  click() {
    if (muted) return;
    tone({ freq: 320, duration: 0.07, type: "square", gain: 0.12 });
  },
  /** Acerto: arpejo alegre ascendente. */
  correct() {
    if (muted) return;
    sequence([
      { freq: 523.25, at: 0 }, // C5
      { freq: 659.25, at: 0.09 }, // E5
      { freq: 783.99, at: 0.18 }, // G5
      { freq: 1046.5, at: 0.27, dur: 0.22 }, // C6
    ]);
  },
  /** Erro: buzina curta descendente, discreta. */
  wrong() {
    if (muted) return;
    tone({ freq: 220, duration: 0.22, type: "sawtooth", gain: 0.14, slideTo: 140 });
  },
  /** Bipe da contagem regressiva final. */
  tick() {
    if (muted) return;
    tone({ freq: 880, duration: 0.07, type: "sine", gain: 0.12 });
  },
  /** Fanfarra do fim de jogo. */
  fanfare() {
    if (muted) return;
    sequence(
      [
        { freq: 523.25, at: 0, dur: 0.14 },
        { freq: 659.25, at: 0.12, dur: 0.14 },
        { freq: 783.99, at: 0.24, dur: 0.14 },
        { freq: 1046.5, at: 0.36, dur: 0.34 },
        { freq: 783.99, at: 0.5, dur: 0.34, gain: 0.14 },
        { freq: 1046.5, at: 0.62, dur: 0.4 },
      ],
      "triangle",
    );
  },
};
