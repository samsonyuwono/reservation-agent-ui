import { memo } from "react";
import ReactMarkdown from "react-markdown";
import type { ChatMessage } from "../api/types";
import { useRelativeTime } from "../hooks/useRelativeTime";
import { AvailabilityCard } from "./AvailabilityCard";
import { ReservationCard } from "./ReservationCard";
import { SniperJobCard } from "./SniperJobCard";
import styles from "./MessageBubble.module.css";

interface Props {
  message: ChatMessage;
  onSend: (text: string) => void;
  onRetry?: () => void;
}

export const MessageBubble = memo(function MessageBubble({ message, onSend, onRetry }: Props) {
  const isUser = message.role === "user";
  const isError = message.isError;
  const relTime = useRelativeTime(message.timestamp);

  return (
    <div
      className={`${styles.row} ${isUser ? styles.userRow : styles.assistantRow}`}
    >
      <div
        className={[
          styles.bubble,
          isUser && styles.userBubble,
          !isUser && !isError && styles.assistantBubble,
          isError && styles.errorBubble,
        ].filter(Boolean).join(" ")}
      >
        {isUser ? (
          <p className={styles.text}>{message.text}</p>
        ) : (
          <div className={styles.markdown}>
            <ReactMarkdown>{message.text}</ReactMarkdown>
          </div>
        )}

        {message.cards?.map((card, i) => {
          switch (card.kind) {
            case "availability":
              return <AvailabilityCard key={i} data={card} onBook={onSend} />;
            case "reservation":
              return <ReservationCard key={i} data={card} />;
            case "sniper":
              return <SniperJobCard key={i} data={card} />;
          }
        })}

        {isError && onRetry && (
          <div className={styles.errorFooter}>
            <button className={styles.retryBtn} onClick={onRetry}>
              Retry
            </button>
          </div>
        )}
      </div>
      <span className={styles.timestamp}>{relTime}</span>
    </div>
  );
});
