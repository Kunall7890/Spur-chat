import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000, // 30 seconds — LLM can be slow
  headers: {
    "Content-Type": "application/json",
  },
});

export interface Message {
  id: string;
  conversation_id: string;
  sender: "user" | "ai";
  text: string;
  created_at: string;
}

export interface SendMessageResponse {
  success: boolean;
  reply: string;
  sessionId: string;
}

export interface HistoryResponse {
  success: boolean;
  sessionId: string;
  messages: Message[];
}

export async function sendMessage(
  message: string,
  sessionId?: string
): Promise<SendMessageResponse> {
  const response = await api.post<SendMessageResponse>("/chat/message", {
    message,
    sessionId,
  });
  return response.data;
}

export async function fetchHistory(
  sessionId: string
): Promise<HistoryResponse> {
  const response = await api.get<HistoryResponse>(`/chat/history/${sessionId}`);
  return response.data;
}