import { useState } from "react";
import type { ReservationCardData } from "../api/types";
import styles from "./ReservationCard.module.css";

interface Props {
  data: ReservationCardData;
}

export function ReservationCard({ data }: Props) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    if (!data.confirmationNumber) return;
    navigator.clipboard.writeText(data.confirmationNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className={styles.card}>
      <div className={styles.badge}>{data.status}</div>
      <h3 className={styles.venue}>{data.venue}</h3>
      <div className={styles.details}>
        <span>{data.date}</span>
        <span className={styles.sep}>&middot;</span>
        <span>{data.time}</span>
        <span className={styles.sep}>&middot;</span>
        <span>{data.partySize} guests</span>
      </div>
      {data.confirmationNumber && (
        <div className={styles.confirmationRow}>
          <span className={styles.confirmation}>
            #{data.confirmationNumber}
          </span>
          <button className={styles.copyBtn} onClick={handleCopy}>
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
      )}
    </div>
  );
}
