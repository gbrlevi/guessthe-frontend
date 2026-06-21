export type GamePhase =
  | "home"
  | "lobby"
  | "starting"
  | "question"
  | "reveal"
  | "scoreboard"
  | "game_over";

export interface MediaPayload {
  kind: "image" | "audio" | "video" | "text";
  url?: string;
  clues?: string[];
}

export interface PlayerPublic {
  id: string;
  name: string;
  score: number;
  is_host: boolean;
  avatar: string;
}

export interface RoomSettings {
  categories: string[];
  total_rounds: number;
  round_duration: number;
  allow_multiple_attempts: boolean;
  end_on_all_correct: boolean;
  depixel_speed: number;
  tension_enabled: boolean;
  tension_ratio: number;
}

export interface RankEntry {
  id?: string;
  name: string;
  score: number;
  avatar?: string;
}

export interface RoundResult {
  id: string;
  name: string;
  correct: boolean;
  score: number;
  avatar: string;
}

// ---- Mensagens servidor -> cliente ----

export interface LobbyUpdate {
  type: "lobby_update";
  code: string;
  state: string;
  host_id: string;
  players: PlayerPublic[];
  settings: RoomSettings;
}

export interface GameStarting {
  type: "game_starting";
  total_rounds: number;
}

export interface QuestionStart {
  type: "question_start";
  round: number;
  total_rounds: number;
  category: string;
  media_type: "image" | "audio" | "text" | "video";
  duration: number;
  media: MediaPayload;
  prefetch_url?: string; // caminho opaco do vídeo p/ pré-buscar durante o palpite
}

export interface RevealUpdate {
  type: "reveal_update";
  level: number;
  time_left: number;
  media: MediaPayload;
}

export interface AnswerResult {
  type: "answer_result";
  correct: boolean;
  locked: boolean;
}

export interface RoundPaused {
  type: "round_paused";
}

export interface RoundResumed {
  type: "round_resumed";
}

export interface RevealAnswer {
  type: "reveal_answer";
  answer: string;
  media: MediaPayload;
  results: RoundResult[];
}

export interface Scoreboard {
  type: "scoreboard";
  round: number;
  total_rounds: number;
  ranking: RankEntry[];
}

export interface GameOver {
  type: "game_over";
  ranking: RankEntry[];
}

export interface ChatMessage {
  type: "chat_message";
  player_id: string;
  player_name: string;
  avatar: string;
  msg_type: "guess" | "correct";
  text: string;
}

export interface ErrorMsg {
  type: "error";
  message: string;
}

export interface Joined {
  type: "joined";
  player_id: string;
}

export interface CloseAnswer {
  type: "close_answer";
}

/**
 * Interstício do Modo Tensão — enviado pelo servidor ANTES da primeira rodada
 * dos últimos 30%. O cliente trava a tela com um overlay por `interstitial_ms`
 * (o servidor só dispara o `question_start` seguinte após esse tempo, então o
 * cronômetro do round não corre durante o overlay). `ranking` traz o Top atual.
 */
export interface TensionIntro {
  type: "tension_intro";
  round: number;
  total_rounds: number;
  interstitial_ms: number;
  ranking: RankEntry[];
}

export type ServerMessage =
  | LobbyUpdate
  | Joined
  | GameStarting
  | QuestionStart
  | RevealUpdate
  | AnswerResult
  | RevealAnswer
  | Scoreboard
  | GameOver
  | RoundPaused
  | RoundResumed
  | ChatMessage
  | ErrorMsg
  | CloseAnswer
  | TensionIntro;

// ---- Mensagens cliente -> servidor ----

export type ClientMessage =
  | { type: "join"; name?: string; avatar?: string }
  | {
      type: "start_game";
      categories: string[];
      total_rounds: number;
      round_duration?: number;
      allow_multiple_attempts?: boolean;
      end_on_all_correct?: boolean;
      depixel_speed?: number;
    }
  | {
      type: "update_settings";
      categories?: string[];
      total_rounds?: number;
      round_duration?: number;
      allow_multiple_attempts?: boolean;
      end_on_all_correct?: boolean;
      depixel_speed?: number;
      tension_enabled?: boolean;
      tension_ratio?: number;
    }
  | { type: "submit_answer"; guess: string }
  | { type: "pause_round" }
  | { type: "resume_round" };
