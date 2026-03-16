import { useEffect, useRef } from "react";
import { getResyEmail, unlinkResy } from "../api/client";
import { useChat } from "../hooks/useChat";
import { MessageBubble } from "../components/MessageBubble";
import { ToolStatus } from "../components/ToolStatus";
import { ChatInput } from "../components/ChatInput";
import { ResyLogo } from "../components/ResyLogo";
import styles from "./Chat.module.css";

interface Props {
  onUnlink: () => void;
}

export function Chat({ onUnlink }: Props) {
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
  }, [messages.length]);

  function handleSignOut() {
    unlinkResy().then(onUnlink).catch(() => {});
  }

  const lastIdx = messages.length - 1;

  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.logo}><ResyLogo subtitle="Concierge" /></h1>
          {resyEmail && (
            <span className={styles.linkedEmail}>{resyEmail}</span>
          )}
        </div>
        <div className={styles.headerActions}>
          <button className={styles.headerBtn} onClick={clearChat}>
            New chat
          </button>
          <button className={styles.headerBtn} onClick={handleSignOut}>
            Sign out
          </button>
        </div>
      </header>

      <main className={styles.messages}>
        {messages.length === 0 && (
          <div className={styles.empty}>
            <p className={styles.emptyTitle}>What table can I find for you? Only for New York City</p>
            <p className={styles.emptyHint}>
              &ldquo;Best sushi spots in the West Village&rdquo;
              &middot; &ldquo;Book Carbone, Friday 7pm, party of 2&rdquo;
              &middot; &ldquo;What&rsquo;s open tonight near SoHo?&rdquo;
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

        {isStreaming && (
          <ToolStatus
            label={activeToolLabel || "Processing your request…"}
            completedTools={completedTools}
          />
        )}

        <div ref={bottomRef} />
      </main>

      <ChatInput onSend={send} disabled={isStreaming} />
    </div>
  );
}
