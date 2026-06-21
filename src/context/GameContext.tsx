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
import { music } from "../lib/music";
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

// Modo Tensão: por padrão os últimos 30% das rodadas (configurável pelo host).
const TENSION_RATIO = 0.7;
const isTensionRound = (round: number, total: number, ratio = TENSION_RATIO) =>
  total > 0 && round > total * ratio;

// Janela de "pânico": nos últimos N segundos a música acelera (1.0x → 1.5x).
const PANIC_WINDOW = 10;

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
  closeAnswer: boolean;
  paused: boolean;

  autocompleteEnabled: boolean;

  // Modo Tensão (últimos 30% das rodadas)
  isTension: boolean;
  tensionIntro: boolean; // overlay de interstício travando a tela
  tensionRanking: RankEntry[]; // Top atual exibido no interstício

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
    tensionEnabled?: boolean;
    tensionRatio?: number;
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
  const [closeAnswer, setCloseAnswer] = useState(false);
  const [paused, setPaused] = useState(false);
  const [autocompleteEnabled, setAutocompleteEnabled] = useState(true);

  const [tensionIntro, setTensionIntro] = useState(false);
  const [tensionRanking, setTensionRanking] = useState<RankEntry[]>([]);

  // Refs para as configs de tensão: permitem leitura dentro de callbacks com
  // deps vazias (applyQuestionStart) sem fechar em valores stale.
  const tensionEnabledRef = useRef(true);
  const tensionRatioRef = useRef(TENSION_RATIO);
  useEffect(() => {
    if (settings) {
      tensionEnabledRef.current = settings.tension_enabled;
      tensionRatioRef.current = settings.tension_ratio;
    }
  }, [settings]);

  // Derivado do estado autoritativo do servidor (round/totalRounds) + config do host.
  const isTension =
    (settings?.tension_enabled ?? true) &&
    isTensionRound(round, totalRounds, settings?.tension_ratio ?? TENSION_RATIO);

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

  // Coordenação dos sons de palpite: o som de erro é adiado por um instante para
  // que, se o palpite for "próximo", o cue suave de close_answer toque sozinho —
  // o som de erro é mais forte e mascararia o alerta. Funciona nas duas ordens
  // de chegada (answer_result→close_answer ou close_answer→answer_result).
  const wrongSoundTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const closeRecentRef = useRef(false);

  const applyQuestionStart = useCallback((msg: QuestionStart) => {
    clearTimeout(wrongSoundTimerRef.current);
    closeRecentRef.current = false;
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
    setCloseAnswer(false);
    setRevealAnswer(null);
    setRevealResults([]);
    setPaused(false);
    setChatMessages([]);
    setTensionIntro(false); // a rodada começou → libera a tela do interstício
    // pré-busca o vídeo do reveal (URL opaca) já durante o palpite, sem bloquear
    setPrefetchVideoUrl(msg.prefetch_url ? `${API}${msg.prefetch_url}` : null);
    setPhase("question");

    // Trilha de fundo da rodada. Perguntas de áudio/vídeo (aberturas de anime)
    // tocam silêncio musical p/ não competir com a mídia; senão ambiente normal
    // ou tensão nas rodadas finais. (rate normaliza p/ 1.0 ao (re)iniciar a faixa.)
    // Refs usados aqui p/ evitar closure stale (callback tem deps vazias).
    const mediaHasSound = msg.media_type === "audio" || msg.media_type === "video";
    if (mediaHasSound) {
      music.play(null);
    } else if (tensionEnabledRef.current && isTensionRound(msg.round, msg.total_rounds, tensionRatioRef.current)) {
      music.play("tension");
    } else {
      music.play("ambient");
    }
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
        setTensionIntro(false);
        setTensionRanking([]);
        setPhase("starting");
        // Toca a música de abertura; a partida só começa quando ela terminar.
        // Garante que nenhuma trilha de fundo siga tocando por cima.
        music.stop();
        stopLoadingMusic();
        const audio = new Audio(loadingQuizUrl);
        audio.muted = sfx.isMuted();
        audio.volume = music.getVolume();
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
        setCloseAnswer(false);
        clearTimeout(wrongSoundTimerRef.current);
        if (msg.correct) {
          closeRecentRef.current = false;
          sfx.correct();
        } else if (closeRecentRef.current) {
          // close_answer já chegou para este palpite → só o cue suave, sem erro.
          closeRecentRef.current = false;
        } else {
          // Adia o erro: se um close_answer chegar logo a seguir, ele cancela
          // este som e toca o alerta gentil no lugar.
          wrongSoundTimerRef.current = setTimeout(() => {
            if (!closeRecentRef.current) sfx.wrong();
            closeRecentRef.current = false;
          }, 150);
        }
        break;
      case "close_answer":
        setCloseAnswer(true);
        closeRecentRef.current = true;
        clearTimeout(wrongSoundTimerRef.current); // cancela o erro adiado
        sfx.near(); // cue sonoro gentil reforçando o aviso "está próxima"
        break;
      case "tension_intro":
        // Calmaria antes da tempestade: trava a tela e silencia a música.
        // O servidor só envia o próximo question_start após interstitial_ms,
        // então o cronômetro do round NÃO corre durante o overlay.
        setTensionRanking(msg.ranking);
        setTensionIntro(true);
        music.play(null); // fade-out imediato da faixa ambiente
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
        music.setRate(1.0); // encerra o "pânico" — normaliza a velocidade da faixa
        setPhase("reveal");
        break;
      case "scoreboard":
        setRanking(msg.ranking);
        setPhase("scoreboard");
        break;
      case "game_over":
        setRanking(msg.ranking);
        setTensionIntro(false);
        setPhase("game_over");
        music.stop(); // encerra a trilha de tensão com fade-out
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
      tensionEnabled?: boolean;
      tensionRatio?: number;
    }) => {
      send({
        type: "update_settings",
        ...(patch.categories !== undefined && { categories: patch.categories }),
        ...(patch.totalRounds !== undefined && { total_rounds: patch.totalRounds }),
        ...(patch.roundDuration !== undefined && { round_duration: patch.roundDuration }),
        ...(patch.allowMultipleAttempts !== undefined && { allow_multiple_attempts: patch.allowMultipleAttempts }),
        ...(patch.endOnAllCorrect !== undefined && { end_on_all_correct: patch.endOnAllCorrect }),
        ...(patch.depixelSpeed !== undefined && { depixel_speed: patch.depixelSpeed }),
        ...(patch.tensionEnabled !== undefined && { tension_enabled: patch.tensionEnabled }),
        ...(patch.tensionRatio !== undefined && { tension_ratio: patch.tensionRatio }),
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
    music.stop();
    setTensionIntro(false);
    setTensionRanking([]);
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
    setCloseAnswer(false);
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

  // PÂNICO (Modo Tensão): nos últimos PANIC_WINDOW segundos a faixa acelera
  // linearmente de 1.0x até 1.5x conforme o tempo decresce. Fora dessa janela
  // (ou fora da rodada de tensão) a velocidade permanece normal.
  useEffect(() => {
    if (phase !== "question" || !isTension || timeLeft == null) return;
    if (timeLeft <= PANIC_WINDOW) {
      const progress = (PANIC_WINDOW - timeLeft) / PANIC_WINDOW; // 0 → 1
      music.setRate(1.0 + 0.5 * Math.min(1, Math.max(0, progress)));
    } else {
      music.setRate(1.0);
    }
  }, [phase, isTension, timeLeft]);

  // Tema visual do Modo Tensão: injeta a classe global no <body> durante o
  // gameplay das rodadas finais (laranja → grafite/preto + destaques vermelhos).
  useEffect(() => {
    const active = isTension && (phase === "question" || phase === "reveal" || phase === "scoreboard");
    document.body.classList.toggle("tension-mode", active);
  }, [isTension, phase]);

  // Limpeza ao desmontar o provider: libera elementos de áudio/timers e remove
  // o tema de tensão (evita vazamento de memória / classe órfã no <body>).
  useEffect(() => {
    return () => {
      music.dispose();
      document.body.classList.remove("tension-mode");
    };
  }, []);

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
      answered, submitting, answerResult, closeAnswer, paused, autocompleteEnabled,
      isTension, tensionIntro, tensionRanking,
      revealAnswer, revealResults, ranking, chatMessages,
      createRoom, joinRoom, startGame, updateSettings, submitAnswer, pauseRound, resumeRound,
      backToLobby, leaveRoom, changeIdentity,
    }),
    [
      phase, status, error, code, myId, isHost, myAvatar, myName, players, settings,
      round, totalRounds, category, mediaType, duration, media, timeLeft,
      answered, submitting, answerResult, closeAnswer, paused, autocompleteEnabled,
      isTension, tensionIntro, tensionRanking,
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
