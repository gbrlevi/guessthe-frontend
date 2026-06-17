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
    label: "Plots Mal Contados",
    icon: "🤔",
    mediaHint: "Qual é esse filme/série/jogo?",
  },
  emoji_quiz: {
    label: "Quiz de Emojis",
    icon: "😂",
    mediaHint: "O que esses emojis representam?",
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
