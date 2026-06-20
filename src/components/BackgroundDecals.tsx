import styles from "../App.module.css";

/**
 * Decals decorativos flutuantes ao fundo (ldk-drift). Portados verbatim do
 * novo_design — puramente visuais, sem lógica.
 */
export function BackgroundDecals() {
  return (
    <div className={styles.decals} aria-hidden>
      <span style={{ position: "absolute", left: "7%", top: "13%", animation: "ldk-drift 7s ease-in-out 0s infinite" }}>
        <svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="#2A1206" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round">
          <path d="M12,2 l2.2,6 6,2.2 -6,2.2 -2.2,6 -2.2,-6 -6,-2.2 6,-2.2 Z" />
        </svg>
      </span>
      <span style={{ position: "absolute", left: "24%", top: "72%", animation: "ldk-drift 9s ease-in-out .6s infinite" }}>
        <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#2A1206" strokeWidth="2" strokeLinejoin="round">
          <path d="M12,3 l2.5,5.6 6.1,.6 -4.6,4.1 1.4,6 -5.4,-3.2 -5.4,3.2 1.4,-6 -4.6,-4.1 6.1,-.6 Z" />
        </svg>
      </span>
      <span style={{ position: "absolute", left: "84%", top: "20%", animation: "ldk-drift 8s ease-in-out 1.1s infinite" }}>
        <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="#2A1206" strokeWidth="2">
          <circle cx="12" cy="12" r="8.5" />
        </svg>
      </span>
      <span style={{ position: "absolute", left: "90%", top: "64%", animation: "ldk-drift 10s ease-in-out .3s infinite" }}>
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#2A1206" strokeWidth="2" strokeLinejoin="round">
          <path d="M12,3 L20,12 L12,21 L4,12 Z" />
        </svg>
      </span>
      <span style={{ position: "absolute", left: "46%", top: "8%", animation: "ldk-drift 7.5s ease-in-out .9s infinite" }}>
        <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="#2A1206" strokeWidth="2.4" strokeLinecap="round">
          <path d="M12,5 V19 M5,12 H19" />
        </svg>
      </span>
      <span style={{ position: "absolute", left: "62%", top: "84%", animation: "ldk-drift 9.5s ease-in-out 1.4s infinite" }}>
        <svg width="46" height="46" viewBox="0 0 24 24" fill="none" stroke="#2A1206" strokeWidth="2" strokeLinejoin="round">
          <rect x="4" y="4" width="16" height="16" rx="4" />
          <circle cx="9" cy="9" r="1.4" fill="#2A1206" />
          <circle cx="12" cy="12" r="1.4" fill="#2A1206" />
          <circle cx="15" cy="15" r="1.4" fill="#2A1206" />
        </svg>
      </span>
      <span style={{ position: "absolute", left: "13%", top: "46%", animation: "ldk-drift 8.5s ease-in-out .2s infinite" }}>
        <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#2A1206" strokeWidth="2" strokeLinejoin="round">
          <path d="M12,20 C4,14 4,7 8.5,7 C11,7 12,9.2 12,9.2 C12,9.2 13,7 15.5,7 C20,7 20,14 12,20 Z" />
        </svg>
      </span>
      <span style={{ position: "absolute", left: "74%", top: "42%", animation: "ldk-drift 7s ease-in-out 1.7s infinite" }}>
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#2A1206" strokeWidth="2" strokeLinejoin="round">
          <path d="M13,2 L6,13 H11 L10,22 18,10 H12 Z" />
        </svg>
      </span>
      <span style={{ position: "absolute", left: "34%", top: "30%", animation: "ldk-drift 9s ease-in-out .5s infinite" }}>
        <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="#2A1206" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9,9 a3,3 0 1 1 5,2 c-1.4,1 -2,1.7 -2,3.2" />
          <circle cx="12" cy="18.5" r="1.1" fill="#2A1206" stroke="none" />
        </svg>
      </span>
      <span style={{ position: "absolute", left: "53%", top: "54%", animation: "ldk-drift 10s ease-in-out 1s infinite" }}>
        <svg width="46" height="46" viewBox="0 0 24 24" fill="none" stroke="#2A1206" strokeWidth="2" strokeLinejoin="round">
          <path d="M4,5 h14 a2,2 0 0 1 2,2 v6 a2,2 0 0 1 -2,2 h-7 l-4,3 v-3 h-1 a2,2 0 0 1 -2,-2 v-6 a2,2 0 0 1 2,-2 Z" />
        </svg>
      </span>
      <span style={{ position: "absolute", left: "5%", top: "80%", animation: "ldk-drift 8s ease-in-out 1.3s infinite" }}>
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#2A1206" strokeWidth="2" strokeLinejoin="round">
          <path d="M12,2 l2.2,6 6,2.2 -6,2.2 -2.2,6 -2.2,-6 -6,-2.2 6,-2.2 Z" />
        </svg>
      </span>
    </div>
  );
}
