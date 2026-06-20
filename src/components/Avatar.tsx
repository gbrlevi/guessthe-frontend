import type { CSSProperties } from "react";
import type { AvatarKind } from "../constants/avatars";

/**
 * Avatar em SVG inline (portado verbatim de novo_design/Avatar.dc.html).
 * Preenche 100% do contêiner — o tamanho é controlado pelo wrapper pai.
 */
const INNER: Record<AvatarKind, JSX.Element> = {
  fox: (
    <>
      <circle cx="50" cy="50" r="44" fill="#FF9E45" stroke="#2A1206" strokeWidth="6" />
      <ellipse cx="38" cy="30" rx="17" ry="9" fill="#FFFFFF" opacity="0.22" />
      <path d="M22,44 L24,14 L46,33 Z" fill="#F2660A" stroke="#2A1206" strokeWidth="4" strokeLinejoin="round" />
      <path d="M78,44 L76,14 L54,33 Z" fill="#F2660A" stroke="#2A1206" strokeWidth="4" strokeLinejoin="round" />
      <ellipse cx="50" cy="66" rx="22" ry="15" fill="#FFFFFF" />
      <circle cx="40" cy="51" r="5.5" fill="#2A1206" />
      <circle cx="38" cy="49" r="2" fill="#fff" />
      <circle cx="60" cy="51" r="5.5" fill="#2A1206" />
      <circle cx="58" cy="49" r="2" fill="#fff" />
      <circle cx="50" cy="62" r="4.5" fill="#2A1206" />
    </>
  ),
  frog: (
    <>
      <circle cx="50" cy="50" r="44" fill="#5BC46A" stroke="#2A1206" strokeWidth="6" />
      <ellipse cx="38" cy="30" rx="17" ry="9" fill="#FFFFFF" opacity="0.22" />
      <circle cx="34" cy="30" r="12" fill="#fff" stroke="#2A1206" strokeWidth="4" />
      <circle cx="34" cy="31" r="5" fill="#2A1206" />
      <circle cx="66" cy="30" r="12" fill="#fff" stroke="#2A1206" strokeWidth="4" />
      <circle cx="66" cy="31" r="5" fill="#2A1206" />
      <path d="M28,56 Q50,78 72,56" fill="none" stroke="#2A1206" strokeWidth="6" strokeLinecap="round" />
      <circle cx="44" cy="52" r="2" fill="#2A1206" />
      <circle cx="56" cy="52" r="2" fill="#2A1206" />
    </>
  ),
  panda: (
    <>
      <circle cx="50" cy="50" r="44" fill="#FFFFFF" stroke="#2A1206" strokeWidth="6" />
      <ellipse cx="38" cy="30" rx="17" ry="9" fill="#FFF6E8" opacity="0.6" />
      <circle cx="28" cy="26" r="12" fill="#2A1206" />
      <circle cx="72" cy="26" r="12" fill="#2A1206" />
      <ellipse cx="38" cy="52" rx="9" ry="11" fill="#2A1206" transform="rotate(-18 38 52)" />
      <ellipse cx="62" cy="52" rx="9" ry="11" fill="#2A1206" transform="rotate(18 62 52)" />
      <circle cx="39" cy="50" r="3" fill="#fff" />
      <circle cx="61" cy="50" r="3" fill="#fff" />
      <circle cx="50" cy="62" r="4" fill="#2A1206" />
      <path d="M42,70 Q50,76 58,70" fill="none" stroke="#2A1206" strokeWidth="4" strokeLinecap="round" />
    </>
  ),
  unicorn: (
    <>
      <circle cx="50" cy="50" r="44" fill="#FFB0D4" stroke="#2A1206" strokeWidth="6" />
      <ellipse cx="38" cy="30" rx="17" ry="9" fill="#FFFFFF" opacity="0.24" />
      <path d="M50,2 L44,30 L56,30 Z" fill="#FFC62E" stroke="#2A1206" strokeWidth="4" strokeLinejoin="round" />
      <path d="M24,42 L26,22 L42,36 Z" fill="#FF8FC0" stroke="#2A1206" strokeWidth="4" strokeLinejoin="round" />
      <path d="M28,40 q-12,12 -2,26 q-12,6 -2,22" fill="none" stroke="#FF6FA0" strokeWidth="7" strokeLinecap="round" />
      <path d="M37,53 q4,5 8,0" fill="none" stroke="#2A1206" strokeWidth="4" strokeLinecap="round" />
      <path d="M55,53 q4,5 8,0" fill="none" stroke="#2A1206" strokeWidth="4" strokeLinecap="round" />
      <circle cx="36" cy="64" r="3.5" fill="#FF6FA0" />
      <circle cx="64" cy="64" r="3.5" fill="#FF6FA0" />
      <path d="M44,64 q6,6 12,0" fill="none" stroke="#2A1206" strokeWidth="4" strokeLinecap="round" />
    </>
  ),
  octopus: (
    <>
      <circle cx="50" cy="50" r="44" fill="#E0639F" stroke="#2A1206" strokeWidth="6" />
      <ellipse cx="38" cy="30" rx="17" ry="9" fill="#FFFFFF" opacity="0.22" />
      <path
        d="M24,62 q5,15 11,2 q5,15 11,2 q5,15 11,2 q5,15 11,2 q5,15 11,2"
        fill="#C44E86"
        stroke="#2A1206"
        strokeWidth="4"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <circle cx="40" cy="48" r="9" fill="#fff" stroke="#2A1206" strokeWidth="3" />
      <circle cx="40" cy="49" r="4" fill="#2A1206" />
      <circle cx="60" cy="48" r="9" fill="#fff" stroke="#2A1206" strokeWidth="3" />
      <circle cx="60" cy="49" r="4" fill="#2A1206" />
      <path d="M44,62 q6,5 12,0" fill="none" stroke="#2A1206" strokeWidth="3.5" strokeLinecap="round" />
    </>
  ),
  dragon: (
    <>
      <circle cx="50" cy="50" r="44" fill="#4FC0A8" stroke="#2A1206" strokeWidth="6" />
      <ellipse cx="38" cy="30" rx="17" ry="9" fill="#FFFFFF" opacity="0.22" />
      <path d="M30,30 L18,12 L38,24 Z" fill="#E9E2BE" stroke="#2A1206" strokeWidth="4" strokeLinejoin="round" />
      <path d="M70,30 L82,12 L62,24 Z" fill="#E9E2BE" stroke="#2A1206" strokeWidth="4" strokeLinejoin="round" />
      <ellipse cx="50" cy="66" rx="18" ry="12" fill="#6FD4BE" />
      <circle cx="45" cy="65" r="2.2" fill="#2A1206" />
      <circle cx="55" cy="65" r="2.2" fill="#2A1206" />
      <path d="M36,46 l9,5" fill="none" stroke="#2A1206" strokeWidth="5" strokeLinecap="round" />
      <path d="M64,46 l-9,5" fill="none" stroke="#2A1206" strokeWidth="5" strokeLinecap="round" />
    </>
  ),
  lion: (
    <>
      <circle cx="50" cy="50" r="44" fill="#E8870A" stroke="#2A1206" strokeWidth="6" />
      <circle cx="32" cy="30" r="8" fill="#FFD98A" stroke="#2A1206" strokeWidth="4" />
      <circle cx="68" cy="30" r="8" fill="#FFD98A" stroke="#2A1206" strokeWidth="4" />
      <circle cx="50" cy="54" r="29" fill="#FFD98A" stroke="#2A1206" strokeWidth="5" />
      <ellipse cx="38" cy="24" rx="13" ry="8" fill="#FFFFFF" opacity="0.18" />
      <circle cx="41" cy="51" r="4" fill="#2A1206" />
      <circle cx="59" cy="51" r="4" fill="#2A1206" />
      <path d="M50,58 l-5,5 a7,7 0 0 0 10,0 Z" fill="#C44E00" />
      <path d="M50,68 v5" fill="none" stroke="#2A1206" strokeWidth="3" strokeLinecap="round" />
    </>
  ),
  penguin: (
    <>
      <circle cx="50" cy="50" r="44" fill="#5AA9E6" stroke="#2A1206" strokeWidth="6" />
      <ellipse cx="38" cy="30" rx="17" ry="9" fill="#FFFFFF" opacity="0.24" />
      <ellipse cx="50" cy="56" rx="24" ry="23" fill="#FFFFFF" stroke="#2A1206" strokeWidth="4" />
      <circle cx="42" cy="48" r="4" fill="#2A1206" />
      <circle cx="58" cy="48" r="4" fill="#2A1206" />
      <path d="M44,56 L56,56 L50,67 Z" fill="#FFA62E" stroke="#2A1206" strokeWidth="3" strokeLinejoin="round" />
    </>
  ),
  whale: (
    <>
      <circle cx="50" cy="50" r="44" fill="#4F86C6" stroke="#2A1206" strokeWidth="6" />
      <ellipse cx="38" cy="30" rx="17" ry="9" fill="#FFFFFF" opacity="0.22" />
      <path d="M44,16 q-4,-9 2,-12" fill="none" stroke="#2A1206" strokeWidth="4" strokeLinecap="round" />
      <path d="M52,16 q4,-9 -2,-12" fill="none" stroke="#2A1206" strokeWidth="4" strokeLinecap="round" />
      <ellipse cx="50" cy="62" rx="24" ry="16" fill="#BFE0F0" />
      <circle cx="41" cy="50" r="4" fill="#2A1206" />
      <circle cx="59" cy="50" r="4" fill="#2A1206" />
      <path d="M36,60 Q50,74 64,60" fill="none" stroke="#2A1206" strokeWidth="5" strokeLinecap="round" />
    </>
  ),
  alien: (
    <>
      <circle cx="50" cy="50" r="44" fill="#8BD450" stroke="#2A1206" strokeWidth="6" />
      <ellipse cx="38" cy="30" rx="17" ry="9" fill="#FFFFFF" opacity="0.24" />
      <path d="M50,16 v-8" fill="none" stroke="#2A1206" strokeWidth="4" strokeLinecap="round" />
      <circle cx="50" cy="6" r="4" fill="#FFC62E" stroke="#2A1206" strokeWidth="3" />
      <ellipse cx="40" cy="52" rx="7" ry="11" fill="#2A1206" transform="rotate(16 40 52)" />
      <ellipse cx="60" cy="52" rx="7" ry="11" fill="#2A1206" transform="rotate(-16 60 52)" />
      <path d="M45,68 q5,5 10,0" fill="none" stroke="#2A1206" strokeWidth="3.5" strokeLinecap="round" />
    </>
  ),
  robot: (
    <>
      <circle cx="50" cy="50" r="44" fill="#B6C2CE" stroke="#2A1206" strokeWidth="6" />
      <ellipse cx="38" cy="30" rx="17" ry="9" fill="#FFFFFF" opacity="0.28" />
      <path d="M50,18 v-8" fill="none" stroke="#2A1206" strokeWidth="4" strokeLinecap="round" />
      <circle cx="50" cy="8" r="4" fill="#FF5436" stroke="#2A1206" strokeWidth="3" />
      <rect x="28" y="40" width="44" height="30" rx="9" fill="#2A1206" />
      <circle cx="40" cy="54" r="4.5" fill="#4FE0C0" />
      <circle cx="60" cy="54" r="4.5" fill="#4FE0C0" />
      <rect x="42" y="62" width="16" height="3.4" rx="1.7" fill="#4FE0C0" />
      <circle cx="18" cy="50" r="3.4" fill="#8A97A3" stroke="#2A1206" strokeWidth="3" />
      <circle cx="82" cy="50" r="3.4" fill="#8A97A3" stroke="#2A1206" strokeWidth="3" />
    </>
  ),
  wolf: (
    <>
      <circle cx="50" cy="50" r="44" fill="#9AA7B3" stroke="#2A1206" strokeWidth="6" />
      <ellipse cx="38" cy="30" rx="17" ry="9" fill="#FFFFFF" opacity="0.2" />
      <path d="M24,40 L20,12 L44,32 Z" fill="#7E8B97" stroke="#2A1206" strokeWidth="4" strokeLinejoin="round" />
      <path d="M76,40 L80,12 L56,32 Z" fill="#7E8B97" stroke="#2A1206" strokeWidth="4" strokeLinejoin="round" />
      <ellipse cx="50" cy="64" rx="19" ry="14" fill="#D6DEE5" />
      <path d="M37,46 l9,5" fill="none" stroke="#2A1206" strokeWidth="5" strokeLinecap="round" />
      <path d="M63,46 l-9,5" fill="none" stroke="#2A1206" strokeWidth="5" strokeLinecap="round" />
      <circle cx="50" cy="60" r="4" fill="#2A1206" />
      <path d="M44,68 q6,5 12,0" fill="none" stroke="#2A1206" strokeWidth="3.5" strokeLinecap="round" />
    </>
  ),
};

export function Avatar({ kind, style }: { kind: AvatarKind; style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 100 100" style={{ width: "100%", height: "100%", display: "block", overflow: "visible", ...style }}>
      {INNER[kind] ?? INNER.fox}
    </svg>
  );
}
