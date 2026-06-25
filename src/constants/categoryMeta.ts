/** Mapeamento dos slugs internos das categorias para label, ícone (emoji) e
 *  o `iconKind` do componente <CatIcon> (SVG do novo_design). */

import type { CatIconKind } from "../components/CatIcon";

export interface CategoryMeta {
  label: string;
  icon: string; // emoji (fallback simples / acessibilidade)
  iconKind: CatIconKind; // ícone SVG neubrutalism
  mediaHint: string; // instrução curta exibida durante o round
}

export const CATEGORY_META: Record<string, CategoryMeta> = {
  pokemon: {
    label: "Pokémon",
    icon: "🐾",
    iconKind: "pokemon",
    mediaHint: "Qual é esse Pokémon?",
  },
  pokemon_cries: {
    label: "Gritos de Pokémon",
    icon: "🔊",
    iconKind: "cry",
    mediaHint: "De qual Pokémon é esse grito?",
  },
  movies: {
    label: "Filmes e Séries",
    icon: "🎬",
    iconKind: "coverMovie",
    mediaHint: "Qual é esse filme ou série?",
  },
  anime: {
    label: "Animes & Mangás",
    icon: "⛩️",
    iconKind: "anime",
    mediaHint: "Qual é esse anime?",
  },
  games: {
    label: "Jogos",
    icon: "🎮",
    iconKind: "coverGame",
    mediaHint: "Qual é esse jogo?",
  },
  flags: {
    label: "Bandeiras",
    icon: "🚩",
    iconKind: "logos", // sem ícone dedicado de bandeira — aproximação até existir um
    mediaHint: "De qual país é essa bandeira?",
  },
  tech_logos: {
    label: "Logos de Tech",
    icon: "💻",
    iconKind: "logos",
    mediaHint: "Qual é essa tecnologia?",
  },
  anime_openings: {
    label: "Aberturas de Anime",
    icon: "🎵",
    iconKind: "anime",
    mediaHint: "De qual anime é essa abertura?",
  },
  sfx: {
    label: "Efeitos Sonoros",
    icon: "💥",
    iconKind: "sfx",
    mediaHint: "De qual jogo é esse som?",
  },
  movie_plots: {
    label: "Plots Mal Contados — Filmes",
    icon: "🤔",
    iconKind: "plot",
    mediaHint: "Qual é esse filme ou série?",
  },
  anime_plots: {
    label: "Plots Mal Contados — Anime",
    icon: "🤔",
    iconKind: "plot",
    mediaHint: "Qual é esse anime?",
  },
  game_plots: {
    label: "Plots Mal Contados — Jogos",
    icon: "🤔",
    iconKind: "plot",
    mediaHint: "Qual é esse jogo?",
  },
  movie_emoji: {
    label: "Emojis — Filmes",
    icon: "😂",
    iconKind: "plot", // sem ícone de emoji — usa o balão de fala
    mediaHint: "Qual filme esses emojis representam?",
  },
  anime_emoji: {
    label: "Emojis — Anime",
    icon: "😂",
    iconKind: "plot",
    mediaHint: "Qual anime esses emojis representam?",
  },
  game_emoji: {
    label: "Emojis — Jogos",
    icon: "😂",
    iconKind: "plot",
    mediaHint: "Qual jogo esses emojis representam?",
  },
  steam_reviews: {
    label: "Reviews da Steam",
    icon: "🎯",
    iconKind: "steam",
    mediaHint: "De qual jogo é essa review?",
  },
  reviews_backlogged: {
    label: "Reviews do Backloggd",
    icon: "📝",
    iconKind: "steam",
    mediaHint: "De qual jogo é essa review?",
  },
  termo_anime: {
    label: "Termo — Anime",
    icon: "🔤",
    iconKind: "anime",
    mediaHint: "Adivinhe a palavra!",
  },
  termo_games: {
    label: "Termo — Games",
    icon: "🔤",
    iconKind: "coverGame",
    mediaHint: "Adivinhe a palavra!",
  },
  termo_pokemon: {
    label: "Termo — Pokémon",
    icon: "🔤",
    iconKind: "pokemon",
    mediaHint: "Adivinhe a palavra!",
  },
  termo_geral: {
    label: "Termo — Geral",
    icon: "🔤",
    iconKind: "plot",
    mediaHint: "Adivinhe a palavra!",
  },
};

/** Retorna metadados de uma categoria, com fallback para o slug bruto. */
export function getCategoryMeta(slug: string): CategoryMeta {
  return (
    CATEGORY_META[slug] ?? {
      label: slug,
      icon: "❓",
      iconKind: "anime",
      mediaHint: "Qual é a resposta?",
    }
  );
}
