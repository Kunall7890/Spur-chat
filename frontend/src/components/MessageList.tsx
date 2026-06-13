import { useEffect, useRef } from "react";
import { ChatMessage } from "../types";

interface Props {
  messages: ChatMessage[];
}

export function MessageList({ messages }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">🛍️</div>
        <p>Hi! I'm the ShopEase support agent.</p>
        <p>Ask me anything about shipping, returns, or payments!</p>
      </div>
    );
  }

  return (
    <div className="message-list">
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={`message ${msg.sender === "user" ? "message-user" : "message-ai"} ${msg.isPending ? "message-pending" : ""}`}
        >
          {msg.sender === "ai" && (
            <div className="avatar">🤖</div>
          )}
          <div className="message-bubble">
            {msg.isPending ? (
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            ) : (
              <p>{msg.text}</p>
            )}
          </div>
          {msg.sender === "user" && (
            <div className="avatar">👤</div>
          )}
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  );
}