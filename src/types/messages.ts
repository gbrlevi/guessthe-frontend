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
}

export interface RoomSettings {
  categories: string[];
  total_rounds: number;
  round_duration: number;
}

export interface RankEntry {
  name: string;
  score: number;
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
  media_type: "image" | "audio" | "text";
  duration: number;
  media: MediaPayload;
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
}

export interface RevealAnswer {
  type: "reveal_answer";
  answer: string;
  media: MediaPayload;
  results: { id: string; name: string; correct: boolean; score: number }[];
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

export interface ErrorMsg {
  type: "error";
  message: string;
}

export type ServerMessage =
  | LobbyUpdate
  | GameStarting
  | QuestionStart
  | RevealUpdate
  | AnswerResult
  | RevealAnswer
  | Scoreboard
  | GameOver
  | ErrorMsg;

// ---- Mensagens cliente -> servidor ----

export type ClientMessage =
  | { type: "join"; name?: string }
  | { type: "start_game"; categories: string[]; total_rounds: number }
  | { type: "submit_answer"; guess: string };
