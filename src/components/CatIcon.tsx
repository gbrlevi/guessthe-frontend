import type { CSSProperties } from "react";

/** Ícones de categoria (portados verbatim de novo_design/CatIcon.dc.html). */
export const CAT_ICON_KINDS = [
  "anime",
  "sfx",
  "plot",
  "steam",
  "coverMovie",
  "coverGame",
  "coverAnime",
  "pokemon",
  "cry",
  "logos",
] as const;

export type CatIconKind = (typeof CAT_ICON_KINDS)[number];

/** Apenas as feições únicas de cada ícone — o círculo base + brilho são comuns. */
const FEATURES: Record<CatIconKind, JSX.Element> = {
  anime: (
    <>
      <path d="M24,55 C36,39 64,39 76,55 C64,66 36,66 24,55 Z" fill="#FFFFFF" stroke="#2A1206" strokeWidth="5" strokeLinejoin="round" />
      <path d="M24,55 C36,39 64,39 76,55" fill="none" stroke="#2A1206" strokeWidth="7" strokeLinecap="round" />
      <circle cx="50" cy="55" r="11" fill="#D6266F" stroke="#2A1206" strokeWidth="4" />
      <circle cx="50" cy="55" r="4" fill="#2A1206" />
      <circle cx="46" cy="51" r="2.6" fill="#FFFFFF" />
      <path d="M73,20 l3,7 7,3 -7,3 -3,7 -3,-7 -7,-3 7,-3 Z" fill="#FFC62E" stroke="#2A1206" strokeWidth="3" strokeLinejoin="round" />
    </>
  ),
  sfx: (
    <>
      <rect x="22" y="39" width="9" height="22" rx="4.5" fill="#D6266F" stroke="#2A1206" strokeWidth="4" />
      <rect x="34" y="30" width="9" height="40" rx="4.5" fill="#FF7A5C" stroke="#2A1206" strokeWidth="4" />
      <rect x="46" y="22" width="9" height="56" rx="4.5" fill="#FFC62E" stroke="#2A1206" strokeWidth="4" />
      <rect x="58" y="30" width="9" height="40" rx="4.5" fill="#FF7A5C" stroke="#2A1206" strokeWidth="4" />
      <rect x="70" y="39" width="9" height="22" rx="4.5" fill="#D6266F" stroke="#2A1206" strokeWidth="4" />
    </>
  ),
  plot: (
    <>
      <path
        d="M28,28 h44 a8,8 0 0 1 8,8 v22 a8,8 0 0 1 -8,8 h-26 l-11,10 v-10 h-7 a8,8 0 0 1 -8,-8 v-22 a8,8 0 0 1 8,-8 Z"
        fill="#FF7A5C"
        stroke="#2A1206"
        strokeWidth="5"
        strokeLinejoin="round"
      />
      <path d="M40,42 a7,7 0 0 1 14,0 c0,5 -7,5 -7,9" fill="none" stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" />
      <circle cx="47" cy="60" r="2.8" fill="#FFFFFF" />
      <path d="M62,38 v16" fill="none" stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" />
      <circle cx="62" cy="60" r="2.8" fill="#FFFFFF" />
    </>
  ),
  steam: (
    <>
      <rect x="24" y="50" width="14" height="26" rx="4" fill="#E8915A" stroke="#2A1206" strokeWidth="5" />
      <path
        d="M40,53 c0,-4 3,-7 5,-12 c2,-5 2,-13 8,-13 c5,0 6,5 5,11 l-1,7 h13 c5,0 8,4 7,9 l-2,12 c-1,5 -5,7 -10,7 h-25 a3,3 0 0 1 -3,-3 Z"
        fill="#FFCBA0"
        stroke="#2A1206"
        strokeWidth="5"
        strokeLinejoin="round"
      />
    </>
  ),
  coverMovie: (
    <g transform="rotate(-4 50 50)">
      <rect x="30" y="23" width="40" height="54" rx="6" fill="#FF5436" stroke="#2A1206" strokeWidth="5" />
      <rect x="30" y="23" width="12" height="54" fill="#2A1206" />
      <rect x="33.5" y="28" width="5" height="5" rx="1" fill="#FFFFFF" />
      <rect x="33.5" y="37" width="5" height="5" rx="1" fill="#FFFFFF" />
      <rect x="33.5" y="46" width="5" height="5" rx="1" fill="#FFFFFF" />
      <rect x="33.5" y="55" width="5" height="5" rx="1" fill="#FFFFFF" />
      <rect x="33.5" y="64" width="5" height="5" rx="1" fill="#FFFFFF" />
      <path d="M50,42 L50,58 L63,50 Z" fill="#FFC62E" stroke="#2A1206" strokeWidth="3" strokeLinejoin="round" />
    </g>
  ),
  coverGame: (
    <g transform="rotate(-4 50 50)">
      <rect x="30" y="23" width="40" height="54" rx="6" fill="#3FBF63" stroke="#2A1206" strokeWidth="5" />
      <rect x="34" y="40" width="32" height="17" rx="8.5" fill="#FFFFFF" stroke="#2A1206" strokeWidth="4" />
      <rect x="41" y="44.5" width="3.4" height="8" rx="1" fill="#2A1206" />
      <rect x="38.3" y="47.3" width="8.8" height="3.4" rx="1" fill="#2A1206" />
      <circle cx="57" cy="46.5" r="2.4" fill="#2A1206" />
      <circle cx="61.5" cy="51" r="2.4" fill="#2A1206" />
      <rect x="38" y="64" width="24" height="5" rx="2.5" fill="#FFFFFF" opacity="0.85" />
    </g>
  ),
  coverAnime: (
    <g transform="rotate(-4 50 50)">
      <rect x="30" y="23" width="40" height="54" rx="6" fill="#FFB0D4" stroke="#2A1206" strokeWidth="5" />
      <path d="M35,35 l9,4" fill="none" stroke="#D6266F" strokeWidth="3" strokeLinecap="round" />
      <path d="M35,46 l10,1" fill="none" stroke="#D6266F" strokeWidth="3" strokeLinecap="round" />
      <path d="M35,57 l9,-3" fill="none" stroke="#D6266F" strokeWidth="3" strokeLinecap="round" />
      <path d="M55,35 l3.5,8 8.5,.7 -6.5,5.6 2,8.2 -7.5,-4.4 -7.5,4.4 2,-8.2 -6.5,-5.6 8.5,-.7 Z" fill="#FFC62E" stroke="#2A1206" strokeWidth="3" strokeLinejoin="round" />
      <rect x="38" y="66" width="24" height="5" rx="2.5" fill="#D6266F" />
    </g>
  ),
  pokemon: (
    <>
      <path d="M33,46 L29,28 L45,42 Z" fill="#2A1206" stroke="#2A1206" strokeWidth="4" strokeLinejoin="round" />
      <path d="M59,46 L63,28 L47,42 Z" fill="#2A1206" stroke="#2A1206" strokeWidth="4" strokeLinejoin="round" />
      <circle cx="46" cy="58" r="18" fill="#2A1206" />
      <circle cx="71" cy="31" r="13" fill="#FFC62E" stroke="#2A1206" strokeWidth="4" />
      <path d="M67,28 a4.5,4.5 0 0 1 9,0 c0,3.5 -4.5,3.5 -4.5,6.5" fill="none" stroke="#2A1206" strokeWidth="3.4" strokeLinecap="round" />
      <circle cx="71.5" cy="39.5" r="2" fill="#2A1206" />
    </>
  ),
  cry: (
    <>
      <path d="M30,46 L26,30 L40,42 Z" fill="#2A1206" stroke="#2A1206" strokeWidth="4" strokeLinejoin="round" />
      <path d="M52,46 L56,30 L42,42 Z" fill="#2A1206" stroke="#2A1206" strokeWidth="4" strokeLinejoin="round" />
      <circle cx="41" cy="56" r="16" fill="#2A1206" />
      <path d="M64,42 a11,11 0 0 1 0,22" fill="none" stroke="#D6266F" strokeWidth="5" strokeLinecap="round" />
      <path d="M71,36 a18,18 0 0 1 0,34" fill="none" stroke="#D6266F" strokeWidth="5" strokeLinecap="round" />
    </>
  ),
  logos: (
    <>
      <path d="M27,21 L73,21 L68.5,71 L50,78 L31.5,71 Z" fill="#FF5A2A" stroke="#2A1206" strokeWidth="6" strokeLinejoin="round" />
      <path d="M50,26 L68,26 L64.2,67.5 L50,72.5 Z" fill="#FF8A52" />
      <path d="M37,33 l1.2,13 h21 l-1.4,15.5 -7.8,2.6 -7.8,-2.6 -0.5,-6" fill="none" stroke="#FFFFFF" strokeWidth="5.5" strokeLinejoin="round" strokeLinecap="round" />
      <path d="M40,40 h13" fill="none" stroke="#FF5A2A" strokeWidth="4" strokeLinecap="round" />
    </>
  ),
};

export function CatIcon({
  kind,
  frame = "#FFF1E0",
  style,
}: {
  kind: CatIconKind;
  frame?: string;
  style?: CSSProperties;
}) {
  return (
    <svg viewBox="0 0 100 100" style={{ width: "100%", height: "100%", display: "block", overflow: "visible", ...style }}>
      <circle cx="50" cy="50" r="45" fill={frame} stroke="#2A1206" strokeWidth="6" />
      <ellipse cx="38" cy="30" rx="18" ry="10" fill="#FFFFFF" opacity="0.30" />
      {FEATURES[kind] ?? FEATURES.anime}
    </svg>
  );
}
