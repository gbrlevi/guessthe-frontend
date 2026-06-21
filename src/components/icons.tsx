/**
 * Ícones em SVG inline, portados verbatim do novo_design. Reaproveitados entre
 * as telas (Home, Lobby, Arena, Revelação). Puramente visuais.
 */

type IconProps = { size?: number };

const base = { display: "block" as const, overflow: "visible" as const };

export function SparkleIcon({ size = 16 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ ...base, flex: "none" }}>
      <path d="M12,2.5 l1.7,4.8 4.8,1.7 -4.8,1.7 -1.7,4.8 -1.7,-4.8 -4.8,-1.7 4.8,-1.7 Z" fill="#D6266F" stroke="#2A1206" strokeWidth="1.4" strokeLinejoin="round" />
      <circle cx="20.5" cy="5" r="1.5" fill="#FF5436" />
      <circle cx="4" cy="18" r="1.5" fill="#3FBF63" />
    </svg>
  );
}

export function PencilIcon({ size = 19 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={base}>
      <path d="M15,4 l5,5 -10,10 -6,1 1,-6 Z" fill="#FFC62E" stroke="#2A1206" strokeWidth="2" strokeLinejoin="round" />
      <path d="M13.3,6 l4.7,4.7" fill="none" stroke="#2A1206" strokeWidth="2" />
    </svg>
  );
}

export function GridIcon({ size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={base}>
      <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" fill="#FF9E45" stroke="#2A1206" strokeWidth="2" />
      <circle cx="8.5" cy="8.5" r="1.7" fill="#2A1206" />
      <circle cx="12" cy="12" r="1.7" fill="#2A1206" />
      <circle cx="15.5" cy="15.5" r="1.7" fill="#2A1206" />
    </svg>
  );
}

export function EyesIcon({ size = 13 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={base}>
      <circle cx="8.5" cy="9" r="3.1" fill="#FFC62E" stroke="#2A1206" strokeWidth="1.6" />
      <circle cx="15.5" cy="9" r="3.1" fill="#FFC62E" stroke="#2A1206" strokeWidth="1.6" />
      <path d="M3.5,19 a8.5,7 0 0 1 17,0 Z" fill="#FFC62E" stroke="#2A1206" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

export function MicIcon({ size = 14 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={base}>
      <path d="M7,4 H17 V8 A5,5 0 0 1 7,8 Z" fill="#FFC62E" stroke="#2A1206" strokeWidth="2" strokeLinejoin="round" />
      <path d="M7,5 A2.6,2.6 0 0 0 7,10.2" fill="none" stroke="#2A1206" strokeWidth="2" />
      <path d="M17,5 A2.6,2.6 0 0 1 17,10.2" fill="none" stroke="#2A1206" strokeWidth="2" />
      <rect x="11" y="13" width="2" height="3.6" fill="#2A1206" />
      <rect x="7.5" y="17.6" width="9" height="2.4" rx="1.2" fill="#2A1206" />
    </svg>
  );
}

export function GlobeIcon({ size = 14 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={base}>
      <circle cx="12" cy="12" r="8" fill="#5AA9E6" stroke="#2A1206" strokeWidth="2" />
      <path d="M4,12 H20 M12,4 a13,13 0 0 1 0,16 a13,13 0 0 1 0,-16" fill="none" stroke="#FFFFFF" strokeWidth="1.6" />
    </svg>
  );
}

export function ChatIcon({ size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={base}>
      <path d="M4,5 h16 a2,2 0 0 1 2,2 v8 a2,2 0 0 1 -2,2 h-9 l-5,4 v-4 h-2 a2,2 0 0 1 -2,-2 v-8 a2,2 0 0 1 2,-2 Z" fill="#FF7A5C" stroke="#2A1206" strokeWidth="2" strokeLinejoin="round" />
      <circle cx="9" cy="11" r="1.4" fill="#fff" />
      <circle cx="13" cy="11" r="1.4" fill="#fff" />
      <circle cx="17" cy="11" r="1.4" fill="#fff" />
    </svg>
  );
}

export function MedalIcon({ size = 23, color = "#FFC62E" }: IconProps & { color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={base}>
      <path d="M8,3 l3,8 M16,3 l-3,8" fill="none" stroke="#FF5436" strokeWidth="2" strokeLinecap="round" />
      <circle cx="12" cy="15" r="6" fill={color} stroke="#2A1206" strokeWidth="2" />
      <path d="M12,11.4 l1.1,2.7 2.9,.2 -2.2,1.9 .7,2.8 -2.5,-1.5 -2.5,1.5 .7,-2.8 -2.2,-1.9 2.9,-.2 Z" fill="#fff" stroke="#2A1206" strokeWidth="0.7" strokeLinejoin="round" />
    </svg>
  );
}

export function StarIcon({ size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={base}>
      <path d="M12,3 l2.5,5.6 6.1,.6 -4.6,4.1 1.4,6 -5.4,-3.2 -5.4,3.2 1.4,-6 -4.6,-4.1 6.1,-.6 Z" fill="#FFC62E" stroke="#2A1206" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

export function CheckIcon({ size = 26 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ ...base, flex: "none" }}>
      <circle cx="12" cy="12" r="10" fill="#FFFFFF" stroke="#2A1206" strokeWidth="2" />
      <path d="M6.5,12.5 l3.5,3.5 7,-8" fill="none" stroke="#3FBF63" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function CopyIcon({ size = 16 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ ...base, flex: "none" }}>
      <rect x="9" y="9" width="11" height="11" rx="2.5" fill="#FFF1E0" stroke="#2A1206" strokeWidth="2" strokeLinejoin="round" />
      <path d="M5,15 H4 a2,2 0 0,1 -2,-2 V4 a2,2 0 0,1 2,-2 H13 a2,2 0 0,1 2,2 v1" fill="none" stroke="#2A1206" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

