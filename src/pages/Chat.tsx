import { useEffect, useRef } from "react";
import { clearToken } from "../api/client";
import { useChat } from "../hooks/useChat";
import { MessageBubble } from "../components/MessageBubble";
import { ToolStatus } from "../components/ToolStatus";
import { ChatInput } from "../components/ChatInput";
import styles from "./Chat.module.css";

interface Props {
  onLogout: () => void;
}

export function Chat({ onLogout }: Props) {
  const { messages, isStreaming, activeToolLabel, send, clearChat } = useChat();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, activeToolLabel]);

  function handleLogout() {
    clearToken();
    onLogout();
  }

  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <h1 className={styles.logo}>Resy Concierge</h1>
        <div className={styles.headerActions}>
          <button className={styles.headerBtn} onClick={clearChat}>
            New chat
          </button>
          <button className={styles.headerBtn} onClick={handleLogout}>
            Sign out
          </button>
        </div>
      </header>

      <main className={styles.messages}>
        {messages.length === 0 && (
          <div className={styles.empty}>
            <p className={styles.emptyTitle}>What table can I find for you?</p>
            <p className={styles.emptyHint}>
              Try &ldquo;Find Italian restaurants in Manhattan&rdquo; or
              &ldquo;Check availability at Carbone for Friday at 7pm for
              2&rdquo;
            </p>
          </div>
        )}

        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} onSend={send} />
        ))}

        {activeToolLabel && <ToolStatus label={activeToolLabel} />}

        <div ref={bottomRef} />
      </main>

      <ChatInput onSend={send} disabled={isStreaming} />
    </div>
  );
}
