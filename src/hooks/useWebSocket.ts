import { useCallback, useRef, useState } from "react";
import type { ClientMessage, ServerMessage } from "../types/messages";

export type WsStatus = "idle" | "connecting" | "open" | "closed";

/**
 * Conexão WebSocket. Mantém uma fila de envio para
 * mensagens disparadas antes de a conexão abrir e expõe send/connect/disconnect.
 */
export function useWebSocket(onMessage: (msg: ServerMessage) => void) {
  const wsRef = useRef<WebSocket | null>(null);
  const queueRef = useRef<ClientMessage[]>([]);
  const handlerRef = useRef(onMessage);
  handlerRef.current = onMessage; // sempre a versão mais recente, sem recriar connect
  const [status, setStatus] = useState<WsStatus>("idle");

  const flush = useCallback(() => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    for (const msg of queueRef.current) ws.send(JSON.stringify(msg));
    queueRef.current = [];
  }, []);

  const connect = useCallback(
    (url: string) => {
      wsRef.current?.close();
      setStatus("connecting");
      const ws = new WebSocket(url);
      ws.onopen = () => {
        setStatus("open");
        flush();
      };
      ws.onclose = () => setStatus("closed");
      ws.onerror = () => setStatus("closed");
      ws.onmessage = (e) => {
        try {
          handlerRef.current(JSON.parse(e.data) as ServerMessage);
        } catch {
          /* ignora payload malformado */
        }
      };
      wsRef.current = ws;
    },
    [flush],
  );

  const send = useCallback((msg: ClientMessage) => {
    const ws = wsRef.current;
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(msg));
    } else {
      queueRef.current.push(msg); // enviado assim que abrir
    }
  }, []);

  const disconnect = useCallback(() => {
    wsRef.current?.close();
    wsRef.current = null;
    setStatus("idle");
  }, []);

  return { status, connect, send, disconnect };
}
