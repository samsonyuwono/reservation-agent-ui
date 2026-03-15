import { useEffect, useState } from "react";
import type { AvailabilityCardData } from "../api/types";
import styles from "./AvailabilityCard.module.css";

interface Props {
  data: AvailabilityCardData;
  onBook: (text: string) => void;
}

export function AvailabilityCard({ data, onBook }: Props) {
  const [confirmId, setConfirmId] = useState<string | null>(null);

  // Auto-reset confirmation after 3s
  useEffect(() => {
    if (!confirmId) return;
    const timer = setTimeout(() => setConfirmId(null), 3000);
    return () => clearTimeout(timer);
  }, [confirmId]);

  function handleClick(slot: { time: string; configId: string }) {
    if (confirmId === slot.configId) {
      setConfirmId(null);
      onBook(`Book the ${slot.time} slot`);
    } else {
      setConfirmId(slot.configId);
    }
  }

  return (
    <div className={styles.card}>
      <div className={styles.meta}>
        {data.date} &middot; {data.partySize} guests
      </div>
      <div className={styles.slots}>
        {data.slots.map((slot) => (
          <button
            key={slot.configId}
            className={`${styles.pill} ${confirmId === slot.configId ? styles.pillConfirm : ""}`}
            onClick={() => handleClick(slot)}
          >
            <span className={styles.pillTime}>
              {confirmId === slot.configId ? "Confirm?" : slot.time}
            </span>
            {confirmId !== slot.configId && slot.type && (
              <span className={styles.pillType}>{slot.type}</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
