import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { useWebSocket } from "../hooks/useWebSocket";
import { sfx } from "../lib/sfx";
import loadingQuizUrl from "../assets/loading_quiz.wav";
import type { AvatarKind } from "../constants/avatars";
import type {
  ChatMessage,
  GamePhase,
  MediaPayload,
  PlayerPublic,
  QuestionStart,
  RankEntry,
  RoomSettings,
  RoundResult,
  ServerMessage,
} from "../types/messages";

const API = import.meta.env.VITE_API_URL;
const WS = import.meta.env.VITE_WS_URL;

const MAX_CHAT_MESSAGES = 80;

interface GameState {
  phase: GamePhase;
  status: string;
  error: string | null;

  code: string | null;
  myId: string | null;
  isHost: boolean;
  myAvatar: AvatarKind;
  myName: string;
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
  revealResults: RoundResult[];
  ranking: RankEntry[];

  chatMessages: ChatMessage[];

  createRoom: (name: string, avatar: AvatarKind, roomName?: string) => Promise<void>;
  joinRoom: (code: string, name: string, avatar: AvatarKind) => void;
  startGame: (
    categories: string[],
    totalRounds: number,
    config: {
      roundDuration: number;
      allowMultipleAttempts: boolean;
      endOnAllCorrect: boolean;
      autocomplete: boolean;
      depixelSpeed: number;
    },
  ) => void;
  updateSettings: (patch: {
    categories?: string[];
    totalRounds?: number;
    roundDuration?: number;
    allowMultipleAttempts?: boolean;
    endOnAllCorrect?: boolean;
    depixelSpeed?: number;
  }) => void;
  submitAnswer: (guess: string) => void;
  pauseRound: () => void;
  resumeRound: () => void;
  backToLobby: () => void;
  leaveRoom: () => void;
  changeIdentity: (name: string, avatar: AvatarKind) => void;
}

const Ctx = createContext<GameState | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [phase, setPhase] = useState<GamePhase>("home");
  const [error, setError] = useState<string | null>(null);
  const [code, setCode] = useState<string | null>(null);
  const [myId, setMyId] = useState<string | null>(null);
  const [hostId, setHostId] = useState<string | null>(null);
  const [myAvatar, setMyAvatar] = useState<AvatarKind>(() => {
    try {
      const saved = localStorage.getItem("ldk-avatar");
      if (saved) return saved as AvatarKind;
    } catch {
      // ignore
    }
    return "fox";
  });
  const [myName, setMyName] = useState(() => {
    try {
      return localStorage.getItem("ldk-nickname") || "";
    } catch {
      return "";
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("ldk-nickname", myName);
    } catch {
      // ignore
    }
  }, [myName]);

  useEffect(() => {
    try {
      localStorage.setItem("ldk-avatar", myAvatar);
    } catch {
      // ignore
    }
  }, [myAvatar]);

  const [players, setPlayers] = useState<PlayerPublic[]>([]);
  const [settings, setSettings] = useState<RoomSettings | null>(null);

  // host autoritativo no servidor: sou host se o meu id == host_id do lobby.
  const isHost = myId != null && myId === hostId;

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
  const [revealResults, setRevealResults] = useState<RoundResult[]>([]);
  const [ranking, setRanking] = useState<RankEntry[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  // URL opaca do vídeo pré-buscada durante o palpite (não exposta no contexto público)
  const [prefetchVideoUrl, setPrefetchVideoUrl] = useState<string | null>(null);

  // Música da tela "a partida vai começar". A primeira pergunta só entra quando
  // essa faixa termina de tocar: se o servidor mandar question_start antes do
  // fim, guardamos a mensagem e a aplicamos no evento "ended" do áudio.
  const loadingAudioRef = useRef<HTMLAudioElement | null>(null);
  const pendingQuestionRef = useRef<QuestionStart | null>(null);

  const applyQuestionStart = useCallback((msg: QuestionStart) => {
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
    setRevealResults([]);
    setPaused(false);
    setChatMessages([]);
    // pré-busca o vídeo do reveal (URL opaca) já durante o palpite, sem bloquear
    setPrefetchVideoUrl(msg.prefetch_url ? `${API}${msg.prefetch_url}` : null);
    setPhase("question");
  }, []);

  // Para a música da tela de início (saída/limpeza) e descarta qualquer
  // pergunta que estivesse aguardando o fim da faixa.
  const stopLoadingMusic = useCallback(() => {
    pendingQuestionRef.current = null;
    const audio = loadingAudioRef.current;
    if (audio) {
      audio.pause();
      audio.src = "";
      loadingAudioRef.current = null;
    }
  }, []);

  const handleMessage = useCallback((msg: ServerMessage) => {
    switch (msg.type) {
      case "joined":
        setMyId(msg.player_id);
        break;
      case "lobby_update":
        setCode(msg.code);
        setHostId(msg.host_id);
        setPlayers(msg.players);
        setSettings(msg.settings);
        if (msg.state === "lobby") setPhase("lobby");
        break;
      case "game_starting": {
        setTotalRounds(msg.total_rounds);
        setRanking([]);
        setChatMessages([]);
        setPhase("starting");
        // Toca a música de abertura; a partida só começa quando ela terminar.
        stopLoadingMusic();
        const audio = new Audio(loadingQuizUrl);
        audio.muted = sfx.isMuted();
        loadingAudioRef.current = audio;
        const flush = () => {
          if (loadingAudioRef.current !== audio) return; // já substituído/parado
          loadingAudioRef.current = null;
          const pending = pendingQuestionRef.current;
          pendingQuestionRef.current = null;
          if (pending) applyQuestionStart(pending);
        };
        audio.addEventListener("ended", flush);
        audio.addEventListener("error", flush);
        // Se o autoplay for bloqueado, não trava a partida: começa imediatamente.
        audio.play().catch(flush);
        break;
      }
      case "question_start":
        // Se a música de abertura ainda está tocando, segura a pergunta até o fim.
        if (loadingAudioRef.current && !loadingAudioRef.current.ended) {
          pendingQuestionRef.current = msg;
        } else {
          applyQuestionStart(msg);
        }
        break;
      case "reveal_update":
        setMedia(msg.media);
        setTimeLeft(msg.time_left);
        break;
      case "answer_result":
        setAnswerResult(msg.correct);
        setAnswered(msg.locked);
        setSubmitting(false);
        if (msg.correct) sfx.correct();
        else sfx.wrong();
        break;
      case "reveal_answer":
        setRevealAnswer(msg.answer);
        setRevealResults(msg.results);
        setMedia(msg.media);
        // Atualiza pontuações acumuladas: results.score é o total do jogador, não o delta.
        setPlayers((prev) =>
          prev.map((p) => {
            const r = msg.results.find((r) => r.id === p.id);
            return r ? { ...p, score: r.score } : p;
          }),
        );
        // o VideoPlayer assume com a MESMA URL (já em cache) → toca instantâneo
        setPrefetchVideoUrl(null);
        setPhase("reveal");
        break;
      case "scoreboard":
        setRanking(msg.ranking);
        setPhase("scoreboard");
        break;
      case "game_over":
        setRanking(msg.ranking);
        setPhase("game_over");
        sfx.fanfare();
        break;
      case "round_paused":
        setPaused(true);
        break;
      case "round_resumed":
        setPaused(false);
        break;
      case "chat_message":
        setChatMessages((prev) => {
          const next = [...prev, msg];
          return next.length > MAX_CHAT_MESSAGES ? next.slice(-MAX_CHAT_MESSAGES) : next;
        });
        break;
      case "error":
        setError(msg.message);
        break;
    }
  }, [applyQuestionStart, stopLoadingMusic]);

  const { status, connect, send, disconnect } = useWebSocket(handleMessage);

  const createRoom = useCallback(
    async (name: string, avatar: AvatarKind, roomName?: string) => {
      setError(null);
      setMyAvatar(avatar);
      setMyName(name);
      const res = await fetch(`${API}/rooms`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ host_name: name, room_name: roomName || null }),
      });
      if (!res.ok) {
        setError("Não foi possível criar a sala.");
        return;
      }
      const data: { code: string; host_id: string } = await res.json();
      // Já sabemos nosso id (== host_id) → isHost autoritativo sem flash de UI.
      setMyId(data.host_id);
      setCode(data.code);
      connect(
        `${WS}/ws/${data.code}?name=${encodeURIComponent(name)}&player_id=${data.host_id}&avatar=${avatar}`,
      );
    },
    [connect],
  );

  const joinRoom = useCallback(
    (roomCode: string, name: string, avatar: AvatarKind) => {
      setError(null);
      setMyId(null); // o servidor envia o id real via "joined"
      setHostId(null);
      setMyAvatar(avatar);
      setMyName(name);
      const c = roomCode.trim().toUpperCase();
      setCode(c);
      connect(`${WS}/ws/${c}?name=${encodeURIComponent(name)}&avatar=${avatar}`);
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
        depixelSpeed: number;
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
        depixel_speed: config.depixelSpeed,
      });
    },
    [send],
  );

  const updateSettings = useCallback(
    (patch: {
      categories?: string[];
      totalRounds?: number;
      roundDuration?: number;
      allowMultipleAttempts?: boolean;
      endOnAllCorrect?: boolean;
      depixelSpeed?: number;
    }) => {
      send({
        type: "update_settings",
        ...(patch.categories !== undefined && { categories: patch.categories }),
        ...(patch.totalRounds !== undefined && { total_rounds: patch.totalRounds }),
        ...(patch.roundDuration !== undefined && { round_duration: patch.roundDuration }),
        ...(patch.allowMultipleAttempts !== undefined && { allow_multiple_attempts: patch.allowMultipleAttempts }),
        ...(patch.endOnAllCorrect !== undefined && { end_on_all_correct: patch.endOnAllCorrect }),
        ...(patch.depixelSpeed !== undefined && { depixel_speed: patch.depixelSpeed }),
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

  // Saída limpa: fecha o WS (servidor remove o jogador e avisa os demais) e
  // restaura todo o estado para a tela inicial.
  const leaveRoom = useCallback(() => {
    disconnect();
    stopLoadingMusic();
    setPhase("home");
    setError(null);
    setCode(null);
    setMyId(null);
    setHostId(null);
    setPlayers([]);
    setSettings(null);
    setRound(0);
    setTotalRounds(0);
    setCategory("");
    setMedia(null);
    setTimeLeft(null);
    setAnswered(false);
    setSubmitting(false);
    setAnswerResult(null);
    setPaused(false);
    setRevealAnswer(null);
    setRevealResults([]);
    setRanking([]);
    setChatMessages([]);
    setPrefetchVideoUrl(null);
  }, [disconnect, stopLoadingMusic]);

  // Se o WebSocket desconectar e o jogador não estiver na tela inicial, limpa o estado e alerta o usuário
  useEffect(() => {
    if (status === "closed" && phase !== "home") {
      setError("Conexão perdida com o servidor.");
      leaveRoom();
    }
  }, [status, phase, leaveRoom]);

  // Troca de identidade (nick/avatar) sem reconectar — o servidor já aceita
  // `join` com name/avatar e replica via lobby_update para todos.
  const changeIdentity = useCallback(
    (name: string, avatar: AvatarKind) => {
      setMyAvatar(avatar);
      setMyName(name);
      send({ type: "join", name, avatar });
    },
    [send],
  );

  const value = useMemo<GameState>(
    () => ({
      phase, status, error, code, myId, isHost, myAvatar, myName, players, settings,
      round, totalRounds, category, mediaType, duration, media, timeLeft,
      answered, submitting, answerResult, paused, autocompleteEnabled,
      revealAnswer, revealResults, ranking, chatMessages,
      createRoom, joinRoom, startGame, updateSettings, submitAnswer, pauseRound, resumeRound,
      backToLobby, leaveRoom, changeIdentity,
    }),
    [
      phase, status, error, code, myId, isHost, myAvatar, myName, players, settings,
      round, totalRounds, category, mediaType, duration, media, timeLeft,
      answered, submitting, answerResult, paused, autocompleteEnabled,
      revealAnswer, revealResults, ranking, chatMessages,
      createRoom, joinRoom, startGame, updateSettings, submitAnswer, pauseRound, resumeRound,
      backToLobby, leaveRoom, changeIdentity,
    ],
  );

  return (
    <Ctx.Provider value={value}>
      {children}
      {/* Pré-busca oculta do vídeo do reveal durante o palpite (proxy limita os bytes) */}
      {prefetchVideoUrl && (
        <video
          key={prefetchVideoUrl}
          src={prefetchVideoUrl}
          preload="auto"
          muted
          style={{ display: "none" }}
        />
      )}
    </Ctx.Provider>
  );
}

export function useGame(): GameState {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useGame deve ser usado dentro de <GameProvider>");
  return ctx;
}
