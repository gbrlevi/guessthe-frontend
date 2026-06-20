/** Avatares disponíveis (portados de novo_design/Avatar.dc.html). */
export const AVATAR_KINDS = [
  "fox",
  "frog",
  "panda",
  "unicorn",
  "octopus",
  "dragon",
  "lion",
  "penguin",
  "whale",
  "alien",
  "robot",
  "wolf",
] as const;

export type AvatarKind = (typeof AVATAR_KINDS)[number];

/**
 * O backend NÃO transmite avatar por jogador. Derivamos um avatar estável a
 * partir de um seed (player.id quando existir, senão o nome) via hash simples.
 * Assim cada jogador tem sempre o mesmo bichinho na sessão, sem depender do back.
 */
export function avatarFor(seed: string): AvatarKind {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (h * 31 + seed.charCodeAt(i)) | 0;
  }
  return AVATAR_KINDS[Math.abs(h) % AVATAR_KINDS.length];
}
