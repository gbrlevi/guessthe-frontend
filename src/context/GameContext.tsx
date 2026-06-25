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
  GameMode,
  GamePhase,
  LetterColor,
  MediaPayload,
  PlayerPublic,
  QuestionStart,
  RankEntry,
  RoomSettings,
  RoundResult,
  ServerMessage,
  SharedGridSubmission,
  TermoMode,
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
// Termo: tensão nos últimos 15s OU na última tentativa (PvP).
const TERMO_TENSION_WINDOW = 15;

export interface TermoRow {
  letters: string[];
  colors: LetterColor[];
}

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

  // Modo Termo
  gameMode: GameMode;
  termoMode: TermoMode;
  wordLength: number;
  maxAttempts: number;
  myRows: TermoRow[]; // minhas linhas confirmadas (cores vêm do servidor)
  solved: boolean;
  attemptsLeft: number;
  opponentProgress: Record<string, LetterColor[][]>; // censurado (PvP)
  sharedRows: SharedGridSubmission[]; // tabuleiro compartilhado
  termoHint: string | null;
  submissionCooldown: number; // segundos
  cooldownUntil: number | null; // epoch ms absoluto
  termoWord: string | null; // palavra revelada (só no reveal)

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
      gameMode: GameMode;
      termoMode: TermoMode;
      submissionCooldown: number;
      termoRoundDuration: number;
      termoHintDelay: number;
      mixedTermoRatio: number;
      tensionEnabled?: boolean;
      tensionRatio?: number;
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
    gameMode?: GameMode;
    termoMode?: TermoMode;
    submissionCooldown?: number;
    termoRoundDuration?: number;
    termoHintDelay?: number;
    mixedTermoRatio?: number;
  }) => void;
  submitAnswer: (guess: string) => void;
  submitGuess: (guess: string) => void;
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

  // --- Modo Termo ---
  const [gameMode, setGameMode] = useState<GameMode>("quiz");
  const [termoMode, setTermoMode] = useState<TermoMode>("pvp_individual");
  const [wordLength, setWordLength] = useState(0);
  const [maxAttempts, setMaxAttempts] = useState(6);
  const [myRows, setMyRows] = useState<TermoRow[]>([]);
  const [solved, setSolved] = useState(false);
  const [attemptsLeft, setAttemptsLeft] = useState(6);
  const [opponentProgress, setOpponentProgress] = useState<Record<string, LetterColor[][]>>({});
  const [sharedRows, setSharedRows] = useState<SharedGridSubmission[]>([]);
  const [termoHint, setTermoHint] = useState<string | null>(null);
  const [submissionCooldown, setSubmissionCooldown] = useState(2);
  const [cooldownUntil, setCooldownUntil] = useState<number | null>(null);
  const [termoWord, setTermoWord] = useState<string | null>(null);

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

  // Refs lidos dentro do dispatcher (deps vazias) — evitam closures stale.
  const myIdRef = useRef<string | null>(null);
  const submissionCooldownRef = useRef(2);
  useEffect(() => { myIdRef.current = myId; }, [myId]);
  useEffect(() => { submissionCooldownRef.current = submissionCooldown; }, [submissionCooldown]);

  // Derivado do estado autoritativo do servidor (round/totalRounds) + config do host.
  const isTension =
    (settings?.tension_enabled ?? true) &&
    isTensionRound(round, totalRounds, settings?.tension_ratio ?? TENSION_RATIO);

  // Termo: última tentativa no PvP é gatilho de tensão (além dos últimos 15s).
  const onLastAttempt =
    gameMode === "termo" && termoMode === "pvp_individual" && !solved && attemptsLeft === 1;
  const termoTensionActive =
    gameMode === "termo" &&
    phase === "question" &&
    (onLastAttempt || (timeLeft != null && timeLeft <= TERMO_TENSION_WINDOW));

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
    const gm: GameMode = msg.game_mode ?? "quiz";
    setRound(msg.round);
    setTotalRounds(msg.total_rounds);
    // No Termo não há `category`: usamos o tema para os metadados do cabeçalho.
    setCategory(msg.category ?? msg.theme ?? "");
    setMediaType(msg.media_type ?? "text");
    setDuration(msg.duration);
    setMedia(msg.media ?? null);
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

    // Reset do estado de Termo a cada rodada (vale tanto p/ Termo quanto p/ Quiz).
    setGameMode(gm);
    setMyRows([]);
    setSolved(false);
    setOpponentProgress({});
    setSharedRows([]);
    setTermoHint(null);
    setCooldownUntil(null);
    setTermoWord(null);
    setAttemptsLeft(msg.max_attempts ?? 6);
    if (gm === "termo") {
      setTermoMode(msg.termo_mode ?? "pvp_individual");
      setWordLength(msg.length ?? 0);
      setMaxAttempts(msg.max_attempts ?? 6);
      setSubmissionCooldown(msg.submission_cooldown ?? 2);
    }

    // pré-busca o vídeo do reveal (URL opaca) já durante o palpite, sem bloquear
    setPrefetchVideoUrl(msg.prefetch_url ? `${API}${msg.prefetch_url}` : null);
    setPhase("question");

    // Trilha de fundo da rodada. Termo usa sempre a faixa ambiente (acelerada na
    // janela de tensão). Perguntas de áudio/vídeo do quiz tocam silêncio musical;
    // senão ambiente normal ou tensão nas rodadas finais do quiz.
    // (rate normaliza p/ 1.0 ao (re)iniciar a faixa.)
    if (gm === "termo") {
      music.play("ambient");
    } else {
      const mediaHasSound = msg.media_type === "audio" || msg.media_type === "video";
      if (mediaHasSound) {
        music.play(null);
      } else if (tensionEnabledRef.current && isTensionRound(msg.round, msg.total_rounds, tensionRatioRef.current)) {
        music.play("tension");
      } else {
        music.play("ambient");
      }
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

      // ---- Modo Termo ----
      case "guess_result": {
        // Resultado completo do MEU palpite (cores autoritativas do servidor).
        setMyRows((prev) => [...prev, { letters: msg.letters, colors: msg.colors }]);
        if (msg.attempts_left != null) setAttemptsLeft(msg.attempts_left);
        if (msg.solved) {
          setSolved(true);
          sfx.correct();
        } else if (msg.attempts_left === 0) {
          sfx.wrong();
        } else {
          sfx.near();
        }
        break;
      }
      case "opponent_progress": {
        // Progresso censurado (PvP): só as cores, anexadas na ordem de chegada.
        setOpponentProgress((prev) => {
          const rows = [...(prev[msg.player_id] ?? []), msg.colors];
          return { ...prev, [msg.player_id]: rows };
        });
        break;
      }
      case "shared_grid_update": {
        setSharedRows((prev) => [...prev, msg.submission]);
        // Arena: pontos são distribuídos na hora → placar ao vivo (reconciliado no reveal).
        if (msg.delta_score) {
          setPlayers((prev) =>
            prev.map((p) =>
              p.id === msg.submission.player_id ? { ...p, score: p.score + msg.delta_score } : p,
            ),
          );
        }
        if (msg.submission.player_id === myIdRef.current) {
          const ok = msg.submission.colors.every((c) => c === "correct");
          if (ok) sfx.correct();
          else sfx.near();
        }
        break;
      }
      case "termo_hint":
        setTermoHint(msg.hint);
        break;
      case "guess_error":
        if (msg.reason === "length") {
          setError(`A palavra tem ${msg.expected_length} letras.`);
        }
        // "closed"/"exhausted": silencioso — a UI já reflete o estado.
        break;
      case "cooldown_error":
        // Re-baseia o cooldown local pelo tempo restante informado pelo servidor.
        setCooldownUntil(Date.now() + (msg.retry_after ?? submissionCooldownRef.current) * 1000);
        break;
      case "termo_solved":
        // O encerramento da rodada vem via reveal; nada a fazer aqui por ora.
        break;
      case "termo_reveal":
        setTermoWord(msg.word);
        setRevealResults(msg.results);
        setRevealAnswer(msg.word);
        setPlayers((prev) =>
          prev.map((p) => {
            const r = msg.results.find((r) => r.id === p.id);
            return r ? { ...p, score: r.score } : p;
          }),
        );
        music.setRate(1.0);
        setPhase("reveal");
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
        gameMode: GameMode;
        termoMode: TermoMode;
        submissionCooldown: number;
        termoRoundDuration: number;
        termoHintDelay: number;
        mixedTermoRatio: number;
        tensionEnabled?: boolean;
        tensionRatio?: number;
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
        game_mode: config.gameMode,
        termo_mode: config.termoMode,
        submission_cooldown: config.submissionCooldown,
        termo_round_duration: config.termoRoundDuration,
        termo_hint_delay: config.termoHintDelay,
        mixed_termo_ratio: config.mixedTermoRatio,
        tension_enabled: config.tensionEnabled,
        tension_ratio: config.tensionRatio,
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
      gameMode?: GameMode;
      termoMode?: TermoMode;
      submissionCooldown?: number;
      termoRoundDuration?: number;
      termoHintDelay?: number;
      mixedTermoRatio?: number;
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
        ...(patch.gameMode !== undefined && { game_mode: patch.gameMode }),
        ...(patch.termoMode !== undefined && { termo_mode: patch.termoMode }),
        ...(patch.submissionCooldown !== undefined && { submission_cooldown: patch.submissionCooldown }),
        ...(patch.termoRoundDuration !== undefined && { termo_round_duration: patch.termoRoundDuration }),
        ...(patch.termoHintDelay !== undefined && { termo_hint_delay: patch.termoHintDelay }),
        ...(patch.mixedTermoRatio !== undefined && { mixed_termo_ratio: patch.mixedTermoRatio }),
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

  const submitGuess = useCallback(
    (guess: string) => {
      if (gameMode !== "termo" || solved) return;
      if (cooldownUntil && Date.now() < cooldownUntil) return;
      send({ type: "submit_guess", guess });
      // cooldown otimista local; o servidor reconfirma/re-baseia via cooldown_error.
      setCooldownUntil(Date.now() + submissionCooldown * 1000);
    },
    [send, gameMode, solved, cooldownUntil, submissionCooldown],
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
    // Modo Termo
    setGameMode("quiz");
    setMyRows([]);
    setSolved(false);
    setOpponentProgress({});
    setSharedRows([]);
    setTermoHint(null);
    setCooldownUntil(null);
    setTermoWord(null);
  }, [disconnect, stopLoadingMusic]);

  // Se o WebSocket desconectar e o jogador não estiver na tela inicial, limpa o estado e alerta o usuário
  useEffect(() => {
    if (status === "closed" && phase !== "home") {
      setError("Conexão perdida com o servidor.");
      leaveRoom();
    }
  }, [status, phase, leaveRoom]);

  // PÂNICO (Modo Tensão): a faixa acelera de 1.0x até 1.5x. No Quiz, nos últimos
  // PANIC_WINDOW s das rodadas de tensão. No Termo, nos últimos TERMO_TENSION_WINDOW s
  // OU instantaneamente (1.5x) quando o jogador está na última tentativa (PvP).
  useEffect(() => {
    if (phase !== "question") return;
    if (gameMode === "termo") {
      if (onLastAttempt) {
        music.setRate(1.5);
      } else if (timeLeft != null && timeLeft <= TERMO_TENSION_WINDOW) {
        const progress = (TERMO_TENSION_WINDOW - timeLeft) / TERMO_TENSION_WINDOW; // 0 → 1
        music.setRate(1.0 + 0.5 * Math.min(1, Math.max(0, progress)));
      } else {
        music.setRate(1.0);
      }
      return;
    }
    if (!isTension || timeLeft == null) return;
    if (timeLeft <= PANIC_WINDOW) {
      const progress = (PANIC_WINDOW - timeLeft) / PANIC_WINDOW; // 0 → 1
      music.setRate(1.0 + 0.5 * Math.min(1, Math.max(0, progress)));
    } else {
      music.setRate(1.0);
    }
  }, [phase, isTension, timeLeft, gameMode, onLastAttempt]);

  // Tema visual do Modo Tensão: injeta a classe global no <body>. No Quiz, durante
  // o gameplay das rodadas finais; no Termo, na janela de tensão / última tentativa.
  useEffect(() => {
    const quizActive =
      gameMode !== "termo" &&
      isTension &&
      (phase === "question" || phase === "reveal" || phase === "scoreboard");
    document.body.classList.toggle("tension-mode", quizActive || termoTensionActive);
  }, [isTension, phase, termoTensionActive, gameMode]);

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
      gameMode, termoMode, wordLength, maxAttempts, myRows, solved, attemptsLeft,
      opponentProgress, sharedRows, termoHint, submissionCooldown, cooldownUntil, termoWord,
      revealAnswer, revealResults, ranking, chatMessages,
      createRoom, joinRoom, startGame, updateSettings, submitAnswer, submitGuess, pauseRound, resumeRound,
      backToLobby, leaveRoom, changeIdentity,
    }),
    [
      phase, status, error, code, myId, isHost, myAvatar, myName, players, settings,
      round, totalRounds, category, mediaType, duration, media, timeLeft,
      answered, submitting, answerResult, closeAnswer, paused, autocompleteEnabled,
      isTension, tensionIntro, tensionRanking,
      gameMode, termoMode, wordLength, maxAttempts, myRows, solved, attemptsLeft,
      opponentProgress, sharedRows, termoHint, submissionCooldown, cooldownUntil, termoWord,
      revealAnswer, revealResults, ranking, chatMessages,
      createRoom, joinRoom, startGame, updateSettings, submitAnswer, submitGuess, pauseRound, resumeRound,
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
