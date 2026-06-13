import { useChat } from "../hooks/useChat";
import { MessageList } from "./MessageList";
import { MessageInput } from "./MessageInput";

export function ChatWidget() {
  const { messages, isLoading, error, send, clearSession } = useChat();

  return (
    <div className="chat-container">
      {/* Header */}
      <div className="chat-header">
        <div className="header-info">
          <div className="status-dot" />
          <div>
            <h1>ShopEase Support</h1>
            <p>Typically replies instantly</p>
          </div>
        </div>
        <button
          className="clear-button"
          onClick={clearSession}
          title="Start new conversation"
        >
          ✕ New Chat
        </button>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="error-banner">
          ⚠️ {error}
        </div>
      )}

      {/* Messages */}
      <div className="messages-container">
        <MessageList messages={messages} />
      </div>

      {/* Input */}
      <div className="input-container">
        <MessageInput onSend={send} isLoading={isLoading} />
        <p className="footer-text">
          Powered by ShopEase AI · support@shopease.com
        </p>
      </div>
    </div>
  );
}