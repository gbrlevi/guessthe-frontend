import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useWebSocket } from "../hooks/useWebSocket";
import type {
  GamePhase,
  MediaPayload,
  PlayerPublic,
  RankEntry,
  RoomSettings,
  ServerMessage,
} from "../types/messages";

const API = import.meta.env.VITE_API_URL;
const WS = import.meta.env.VITE_WS_URL;

interface GameState {
  phase: GamePhase;
  status: string;
  error: string | null;

  code: string | null;
  isHost: boolean;
  players: PlayerPublic[];
  settings: RoomSettings | null;

  round: number;
  totalRounds: number;
  category: string;
  mediaType: "image" | "audio" | "video" | "text";
  duration: number;
  media: MediaPayload | null;
  timeLeft: number | null;

  answered: boolean;
  submitting: boolean;
  answerResult: boolean | null;
  paused: boolean;

  autocompleteEnabled: boolean;

  revealAnswer: string | null;
  ranking: RankEntry[];

  createRoom: (name: string) => Promise<void>;
  joinRoom: (code: string, name: string) => void;
  startGame: (
    categories: string[],
    totalRounds: number,
    config: {
      roundDuration: number;
      allowMultipleAttempts: boolean;
      endOnAllCorrect: boolean;
      autocomplete: boolean;
    },
  ) => void;
  submitAnswer: (guess: string) => void;
  pauseRound: () => void;
  resumeRound: () => void;
  backToLobby: () => void;
}

const Ctx = createContext<GameState | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [phase, setPhase] = useState<GamePhase>("home");
  const [error, setError] = useState<string | null>(null);
  const [code, setCode] = useState<string | null>(null);
  const [isHost, setIsHost] = useState(false);
  const [players, setPlayers] = useState<PlayerPublic[]>([]);
  const [settings, setSettings] = useState<RoomSettings | null>(null);

  const [round, setRound] = useState(0);
  const [totalRounds, setTotalRounds] = useState(0);
  const [category, setCategory] = useState("");
  const [mediaType, setMediaType] = useState<"image" | "audio" | "video" | "text">("image");
  const [duration, setDuration] = useState(20);
  const [media, setMedia] = useState<MediaPayload | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  const [answered, setAnswered] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [answerResult, setAnswerResult] = useState<boolean | null>(null);
  const [paused, setPaused] = useState(false);
  const [autocompleteEnabled, setAutocompleteEnabled] = useState(true);

  const [revealAnswer, setRevealAnswer] = useState<string | null>(null);
  const [ranking, setRanking] = useState<RankEntry[]>([]);

  const handleMessage = useCallback((msg: ServerMessage) => {
    switch (msg.type) {
      case "lobby_update":
        setCode(msg.code);
        setPlayers(msg.players);
        setSettings(msg.settings);
        if (msg.state === "lobby") setPhase("lobby");
        break;
      case "game_starting":
        setTotalRounds(msg.total_rounds);
        setRanking([]);
        setPhase("starting");
        break;
      case "question_start":
        setRound(msg.round);
        setTotalRounds(msg.total_rounds);
        setCategory(msg.category);
        setMediaType(msg.media_type);
        setDuration(msg.duration);
        setMedia(msg.media);
        setTimeLeft(Math.round(msg.duration));
        setAnswered(false);
        setSubmitting(false);
        setAnswerResult(null);
        setRevealAnswer(null);
        setPaused(false);
        setPhase("question");
        break;
      case "reveal_update":
        setMedia(msg.media);
        setTimeLeft(msg.time_left);
        break;
      case "answer_result":
        setAnswerResult(msg.correct);
        setAnswered(msg.locked);
        setSubmitting(false);
        break;
      case "reveal_answer":
        setRevealAnswer(msg.answer);
        setMedia(msg.media);
        setPhase("reveal");
        break;
      case "scoreboard":
        setRanking(msg.ranking);
        setPhase("scoreboard");
        break;
      case "game_over":
        setRanking(msg.ranking);
        setPhase("game_over");
        break;
      case "round_paused":
        setPaused(true);
        break;
      case "round_resumed":
        setPaused(false);
        break;
      case "error":
        setError(msg.message);
        break;
    }
  }, []);

  const { status, connect, send } = useWebSocket(handleMessage);

  const createRoom = useCallback(
    async (name: string) => {
      setError(null);
      const res = await fetch(`${API}/rooms`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ host_name: name }),
      });
      if (!res.ok) {
        setError("Não foi possível criar a sala.");
        return;
      }
      const data: { code: string; host_id: string } = await res.json();
      setIsHost(true);
      setCode(data.code);
      connect(
        `${WS}/ws/${data.code}?name=${encodeURIComponent(name)}&player_id=${data.host_id}`,
      );
    },
    [connect],
  );

  const joinRoom = useCallback(
    (roomCode: string, name: string) => {
      setError(null);
      setIsHost(false);
      const c = roomCode.trim().toUpperCase();
      setCode(c);
      connect(`${WS}/ws/${c}?name=${encodeURIComponent(name)}`);
    },
    [connect],
  );

  const startGame = useCallback(
    (
      categories: string[],
      rounds: number,
      config: {
        roundDuration: number;
        allowMultipleAttempts: boolean;
        endOnAllCorrect: boolean;
        autocomplete: boolean;
      },
    ) => {
      setAutocompleteEnabled(config.autocomplete);
      send({
        type: "start_game",
        categories,
        total_rounds: rounds,
        round_duration: config.roundDuration,
        allow_multiple_attempts: config.allowMultipleAttempts,
        end_on_all_correct: config.endOnAllCorrect,
      });
    },
    [send],
  );

  const submitAnswer = useCallback(
    (guess: string) => {
      if (answered || submitting) return;
      setSubmitting(true);
      send({ type: "submit_answer", guess });
    },
    [send, answered, submitting],
  );

  const pauseRound = useCallback(() => send({ type: "pause_round" }), [send]);
  const resumeRound = useCallback(() => send({ type: "resume_round" }), [send]);

  const backToLobby = useCallback(() => {
    send({ type: "join" });
  }, [send]);

  const value = useMemo<GameState>(
    () => ({
      phase, status, error, code, isHost, players, settings,
      round, totalRounds, category, mediaType, duration, media, timeLeft,
      answered, submitting, answerResult, paused, autocompleteEnabled,
      revealAnswer, ranking,
      createRoom, joinRoom, startGame, submitAnswer, pauseRound, resumeRound, backToLobby,
    }),
    [
      phase, status, error, code, isHost, players, settings,
      round, totalRounds, category, mediaType, duration, media, timeLeft,
      answered, submitting, answerResult, paused, autocompleteEnabled,
      revealAnswer, ranking,
      createRoom, joinRoom, startGame, submitAnswer, pauseRound, resumeRound, backToLobby,
    ],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useGame(): GameState {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useGame deve ser usado dentro de <GameProvider>");
  return ctx;
}
