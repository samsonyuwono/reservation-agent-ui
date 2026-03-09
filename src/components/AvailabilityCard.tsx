import type { AvailabilityCardData } from "../api/types";
import styles from "./AvailabilityCard.module.css";

interface Props {
  data: AvailabilityCardData;
  onBook: (text: string) => void;
}

export function AvailabilityCard({ data, onBook }: Props) {
  return (
    <div className={styles.card}>
      <div className={styles.meta}>
        {data.date} &middot; {data.partySize} guests
      </div>
      <div className={styles.slots}>
        {data.slots.map((slot) => (
          <button
            key={slot.configId}
            className={styles.pill}
            onClick={() => onBook(`Book the ${slot.time} slot`)}
            title={slot.type}
          >
            {slot.time}
          </button>
        ))}
      </div>
    </div>
  );
}
