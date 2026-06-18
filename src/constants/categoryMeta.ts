/** Mapeamento dos slugs internos das categorias para label e ícone exibidos na UI. */

export interface CategoryMeta {
  label: string;
  icon: string;
  mediaHint: string; // instrução curta exibida durante o round
}

export const CATEGORY_META: Record<string, CategoryMeta> = {
  pokemon: {
    label: "Pokémon",
    icon: "🐾",
    mediaHint: "Qual é esse Pokémon?",
  },
  pokemon_cries: {
    label: "Gritos de Pokémon",
    icon: "🔊",
    mediaHint: "De qual Pokémon é esse grito?",
  },
  movies: {
    label: "Filmes e Séries",
    icon: "🎬",
    mediaHint: "Qual é esse filme ou série?",
  },
  anime: {
    label: "Animes & Mangás",
    icon: "⛩️",
    mediaHint: "Qual é esse anime?",
  },
  games: {
    label: "Jogos",
    icon: "🎮",
    mediaHint: "Qual é esse jogo?",
  },
  flags: {
    label: "Bandeiras",
    icon: "🚩",
    mediaHint: "De qual país é essa bandeira?",
  },
  tech_logos: {
    label: "Logos de Tech",
    icon: "💻",
    mediaHint: "Qual é essa tecnologia?",
  },
  anime_openings: {
    label: "Aberturas de Anime",
    icon: "🎵",
    mediaHint: "De qual anime é essa abertura?",
  },
  sfx: {
    label: "Efeitos Sonoros",
    icon: "💥",
    mediaHint: "De qual jogo é esse som?",
  },
  movie_plots: {
    label: "Plots Mal Contados — Filmes",
    icon: "🤔",
    mediaHint: "Qual é esse filme ou série?",
  },
  anime_plots: {
    label: "Plots Mal Contados — Anime",
    icon: "🤔",
    mediaHint: "Qual é esse anime?",
  },
  game_plots: {
    label: "Plots Mal Contados — Jogos",
    icon: "🤔",
    mediaHint: "Qual é esse jogo?",
  },
  movie_emoji: {
    label: "Emojis — Filmes",
    icon: "😂",
    mediaHint: "Qual filme esses emojis representam?",
  },
  anime_emoji: {
    label: "Emojis — Anime",
    icon: "😂",
    mediaHint: "Qual anime esses emojis representam?",
  },
  game_emoji: {
    label: "Emojis — Jogos",
    icon: "😂",
    mediaHint: "Qual jogo esses emojis representam?",
  },
  steam_reviews: {
    label: "Reviews da Steam",
    icon: "🎯",
    mediaHint: "De qual jogo é essa review?",
  },
};

/** Retorna label + ícone para uma categoria, com fallback para o slug bruto. */
export function getCategoryMeta(slug: string): CategoryMeta {
  return (
    CATEGORY_META[slug] ?? {
      label: slug,
      icon: "❓",
      mediaHint: "Qual é a resposta?",
    }
  );
}
