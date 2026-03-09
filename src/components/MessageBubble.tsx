import type { ChatMessage } from "../api/types";
import { AvailabilityCard } from "./AvailabilityCard";
import { ReservationCard } from "./ReservationCard";
import { SniperJobCard } from "./SniperJobCard";
import styles from "./MessageBubble.module.css";

interface Props {
  message: ChatMessage;
  onSend: (text: string) => void;
}

export function MessageBubble({ message, onSend }: Props) {
  const isUser = message.role === "user";

  return (
    <div
      className={`${styles.row} ${isUser ? styles.userRow : styles.assistantRow}`}
    >
      <div
        className={`${styles.bubble} ${isUser ? styles.userBubble : styles.assistantBubble}`}
      >
        <p className={styles.text}>{message.text}</p>

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
      </div>
    </div>
  );
}
