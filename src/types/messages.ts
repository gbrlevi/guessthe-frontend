export type GamePhase =
  | "home"
  | "lobby"
  | "starting"
  | "question"
  | "reveal"
  | "scoreboard"
  | "game_over";

// ---- Modo Termo ----
export type GameMode = "quiz" | "termo" | "misto";
export type TermoMode = "pvp_individual" | "tabuleiro_compartilhado";
/** Cor de cada letra (estilo Wordle/Termo). "empty"/"filled" são estados locais
 *  da grade (não vêm do servidor). */
export type LetterColor = "correct" | "present" | "absent" | "empty" | "filled";

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
  // Modo Termo
  game_mode: GameMode;
  termo_mode: TermoMode;
  termo_round_duration: number;
  submission_cooldown: number;
  termo_hint_delay: number;
  mixed_termo_ratio: number;
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
  duration: number;
  // Quiz (ausentes no Termo)
  category?: string;
  media_type?: "image" | "audio" | "text" | "video";
  media?: MediaPayload;
  prefetch_url?: string; // caminho opaco do vídeo p/ pré-buscar durante o palpite
  // Termo (ausentes no Quiz) — NUNCA traz a palavra
  game_mode?: GameMode;
  termo_mode?: TermoMode;
  theme?: string;
  length?: number;
  max_attempts?: number;
  submission_cooldown?: number;
  hint_delay?: number;
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

// ---- Mensagens do Modo Termo (servidor -> cliente) ----

export interface SharedGridSubmission {
  player_id: string;
  player_name: string;
  avatar: string;
  letters: string[];
  colors: LetterColor[];
}

/** Resultado completo do MEU palpite (só o autor recebe as letras+cores). */
export interface TermoGuessResult {
  type: "guess_result";
  accepted: boolean;
  letters: string[];
  colors: LetterColor[];
  attempt_index: number;
  attempts_left: number | null;
  solved: boolean;
}

export interface TermoGuessError {
  type: "guess_error";
  reason: "length" | "closed" | "exhausted";
  expected_length?: number;
}

/** Progresso CENSURADO de um oponente (PVP): apenas as cores, sem as letras. */
export interface OpponentProgress {
  type: "opponent_progress";
  player_id: string;
  player_name: string;
  avatar: string;
  colors: LetterColor[];
  attempts_left: number;
  solved: boolean;
}

export interface SharedGridUpdate {
  type: "shared_grid_update";
  submission: SharedGridSubmission;
  delta_score: number;
}

export interface TermoSolved {
  type: "termo_solved";
  player_id: string;
  player_name: string;
}

export interface TermoHint {
  type: "termo_hint";
  hint: string;
}

export interface CooldownError {
  type: "cooldown_error";
  message: string;
  retry_after?: number;
}

export interface TermoReveal {
  type: "termo_reveal";
  word: string;
  theme: string;
  hint: string;
  results: RoundResult[];
  shared_grid?: SharedGridSubmission[];
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
  | TensionIntro
  | TermoGuessResult
  | TermoGuessError
  | OpponentProgress
  | SharedGridUpdate
  | TermoSolved
  | TermoHint
  | CooldownError
  | TermoReveal;

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
      tension_enabled?: boolean;
      tension_ratio?: number;
      game_mode?: GameMode;
      termo_mode?: TermoMode;
      termo_round_duration?: number;
      submission_cooldown?: number;
      termo_hint_delay?: number;
      mixed_termo_ratio?: number;
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
      game_mode?: GameMode;
      termo_mode?: TermoMode;
      termo_round_duration?: number;
      submission_cooldown?: number;
      termo_hint_delay?: number;
      mixed_termo_ratio?: number;
    }
  | { type: "submit_answer"; guess: string }
  | { type: "submit_guess"; guess: string }
  | { type: "pause_round" }
  | { type: "resume_round" };
