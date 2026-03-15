import { useEffect, useRef } from "react";
import { clearToken, getResyEmail, unlinkResy } from "../api/client";
import { useChat } from "../hooks/useChat";
import { MessageBubble } from "../components/MessageBubble";
import { ToolStatus } from "../components/ToolStatus";
import { ChatInput } from "../components/ChatInput";
import styles from "./Chat.module.css";

interface Props {
  onLogout: () => void;
  onUnlink: () => void;
}

export function Chat({ onLogout, onUnlink }: Props) {
  const {
    messages,
    isStreaming,
    activeToolLabel,
    completedTools,
    send,
    retry,
    clearChat,
  } = useChat();
  const bottomRef = useRef<HTMLDivElement>(null);
  const resyEmail = getResyEmail();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, activeToolLabel]);

  function handleLogout() {
    clearToken();
    onLogout();
  }

  async function handleUnlink() {
    await unlinkResy();
    onUnlink();
  }

  const lastIdx = messages.length - 1;

  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.logo}>Resy Concierge</h1>
          {resyEmail && (
            <span className={styles.linkedEmail}>{resyEmail}</span>
          )}
        </div>
        <div className={styles.headerActions}>
          <button className={styles.headerBtn} onClick={clearChat}>
            New chat
          </button>
          <button className={styles.headerBtn} onClick={handleUnlink}>
            Unlink Resy
          </button>
          <button className={styles.headerBtn} onClick={handleLogout}>
            Sign out
          </button>
        </div>
      </header>

      <main className={styles.messages}>
        {messages.length === 0 && (
          <div className={styles.empty}>
            <p className={styles.emptyTitle}>What table can I find for you? Only for New York City</p>
            <p className={styles.emptyHint}>
              Try &ldquo;Find Italian restaurants in Manhattan&rdquo; or
              &ldquo;Check availability at Carbone for Friday at 7pm for
              2&rdquo;
            </p>
            <p>Reservation Sniper Now in BETA</p>
          </div>
        )}

        {messages.map((msg, i) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            onSend={send}
            onRetry={i === lastIdx && msg.isError ? retry : undefined}
          />
        ))}

        {activeToolLabel && (
          <ToolStatus label={activeToolLabel} completedTools={completedTools} />
        )}

        <div ref={bottomRef} />
      </main>

      <ChatInput onSend={send} disabled={isStreaming} />
    </div>
  );
}
