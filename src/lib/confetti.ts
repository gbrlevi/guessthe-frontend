/**
 * Confete via `canvas-confetti` para o feedback de ACERTO do jogador.
 * Diferente do `<Confetti>` decorativo (CSS, queda contínua usada no fim de jogo),
 * aqui disparamos "canhões" laterais pontuais: dois jatos vindos das bordas
 * esquerda e direita da tela, como manda a spec de revelação de resultados.
 *
 * O canvas é criado uma única vez (reaproveitado entre disparos) e fica em
 * `position: fixed; pointer-events: none`, acima de tudo.
 */
import confetti from "canvas-confetti";

const PALETTE = ["#FFC62E", "#FF5436", "#3FBF63", "#D6266F", "#FF9E45", "#FFE08A"];

type Cannon = ReturnType<typeof confetti.create>;
let cannon: Cannon | null = null;

function getCannon(): Cannon | null {
  if (typeof document === "undefined") return null;
  if (cannon) return cannon;
  const canvas = document.createElement("canvas");
  canvas.style.position = "fixed";
  canvas.style.inset = "0";
  canvas.style.width = "100%";
  canvas.style.height = "100%";
  canvas.style.pointerEvents = "none";
  canvas.style.zIndex = "200";
  document.body.appendChild(canvas);
  cannon = confetti.create(canvas, { resize: true, useWorker: true });
  return cannon;
}

/** Dispara dois jatos de confete a partir das laterais (acerto do jogador). */
export function fireSideConfetti() {
  const fire = getCannon();
  if (!fire) return;
  const base = {
    particleCount: 60,
    spread: 70,
    startVelocity: 55,
    ticks: 220,
    colors: PALETTE,
    zIndex: 200,
    disableForReducedMotion: true,
  };
  // canhão esquerdo → mira para a direita-cima
  fire({ ...base, angle: 60, origin: { x: 0, y: 0.65 } });
  // canhão direito → mira para a esquerda-cima
  fire({ ...base, angle: 120, origin: { x: 1, y: 0.65 } });
}
