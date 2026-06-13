import { useState, KeyboardEvent } from "react";

interface Props {
  onSend: (text: string) => void;
  isLoading: boolean;
}

export function MessageInput({ onSend, isLoading }: Props) {
  const [text, setText] = useState("");

  function handleSend() {
    if (!text.trim() || isLoading) return;
    onSend(text.trim());
    setText("");
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="input-area">
      <textarea
        className="message-input"
        placeholder="Type your message... (Enter to send)"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={isLoading}
        rows={1}
        maxLength={1000}
      />
      <button
        className="send-button"
        onClick={handleSend}
        disabled={isLoading || !text.trim()}
      >
        {isLoading ? (
          <span className="spinner" />
        ) : (
          <span>➤</span>
        )}
      </button>
    </div>
  );
}