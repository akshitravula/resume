import { useEffect, useRef, useCallback } from "react";

const BASE_URL = import.meta.env.VITE_BACKEND_URL;

export function useResumeSocket(resumeId: string | undefined) {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeout = useRef<NodeJS.Timeout | null>(null);
  const retryCount = useRef(0);

  const connect = useCallback(() => {
    if (!resumeId) return;
    const WS_URL = `${BASE_URL}/resume-chat-ws/${resumeId}`;
    const token = localStorage.getItem("token");
    if (!token) throw new Error("No token found");

    // Close existing connection
    if (wsRef.current) {
      wsRef.current.close(1000, "Reconnecting");
    }

    const ws = new WebSocket(`${WS_URL}?token=${token}`);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("WebSocket connected");
      retryCount.current = 0; // reset retry count on successful connection
    };

    ws.onclose = (e) => {
      console.warn("WebSocket closed", e.reason);
      if (e.code !== 1000) {
        // Exponential backoff: min(30s, 2^retryCount * 1s)
        const timeout = Math.min(30000, Math.pow(2, retryCount.current) * 1000);
        reconnectTimeout.current = setTimeout(() => {
          retryCount.current += 1;
          connect();
        }, timeout);
      }
    };

    ws.onerror = (err) => {
      console.error("WebSocket error", err);
      ws.close(); // triggers onclose → reconnect
    };
  }, [resumeId]);

  useEffect(() => {
    connect();
    return () => {
      if (reconnectTimeout.current) clearTimeout(reconnectTimeout.current);
      wsRef.current?.close(1000, "Component unmounted");
    };
  }, [connect]);

  const send = useCallback((data: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
    } else {
      console.warn("WebSocket not ready");
    }
  }, []);

  return { wsRef, send };
}
