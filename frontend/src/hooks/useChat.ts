import { useState, useEffect, useCallback } from "react";
import { sendMessage, fetchHistory } from "../api/chat";
import { ChatMessage } from "../type";

const SESSION_KEY = "shopease_session_id";

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // On mount — restore session from localStorage
  useEffect(() => {
    const savedSession = localStorage.getItem(SESSION_KEY);
    if (savedSession) {
      loadHistory(savedSession);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadHistory(sid: string) {
    try {
      const data = await fetchHistory(sid);
      if (data.success && data.messages.length > 0) {
        setSessionId(sid);
        setMessages(
          data.messages.map((msg) => ({
            id: msg.id,
            sender: msg.sender,
            text: msg.text,
            created_at: msg.created_at,
          }))
        );
      } else {
        localStorage.removeItem(SESSION_KEY);
      }
    } catch (_e) {
      localStorage.removeItem(SESSION_KEY);
    }
  }

  const send = useCallback(
    async (text: string) => {
      if (!text.trim() || isLoading) return;

      setError(null);

      const userMessage: ChatMessage = {
        id: `temp-${Date.now()}`,
        sender: "user",
        text: text.trim(),
        created_at: new Date().toISOString(),
      };

      const typingMessage: ChatMessage = {
        id: "typing",
        sender: "ai",
        text: "...",
        created_at: new Date().toISOString(),
        isPending: true,
      };

      setMessages((prev) => [...prev, userMessage, typingMessage]);
      setIsLoading(true);

      try {
        const data = await sendMessage(text.trim(), sessionId || undefined);

        if (!sessionId) {
          setSessionId(data.sessionId);
          localStorage.setItem(SESSION_KEY, data.sessionId);
        }

        setMessages((prev) => [
          ...prev.filter((m) => m.id !== "typing"),
          {
            id: `ai-${Date.now()}`,
            sender: "ai",
            text: data.reply,
            created_at: new Date().toISOString(),
          },
        ]);
      } catch (_e) {
        setMessages((prev) => prev.filter((m) => m.id !== "typing"));
        setError("Failed to send message. Please try again.");
      } finally {
        setIsLoading(false);
      }
    },
    [sessionId, isLoading]
  );

  function clearSession() {
    localStorage.removeItem(SESSION_KEY);
    setSessionId(null);
    setMessages([]);
    setError(null);
  }

  return { messages, isLoading, error, send, clearSession, sessionId };
}