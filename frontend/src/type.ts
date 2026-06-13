export interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  created_at: string;
  // optimistic messages don't have these yet
  isPending?: boolean;
  isError?: boolean;
}