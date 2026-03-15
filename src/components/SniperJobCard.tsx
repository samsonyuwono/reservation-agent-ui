import { memo } from "react";
import type { SniperJobCardData } from "../api/types";
import styles from "./SniperJobCard.module.css";

interface Props {
  data: SniperJobCardData;
}

export const SniperJobCard = memo(function SniperJobCard({ data }: Props) {
  const statusClass =
    data.status === "completed"
      ? styles.statusSuccess
      : data.status === "failed"
        ? styles.statusFailed
        : styles.statusPending;

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <span className={styles.jobId}>Sniper #{data.jobId}</span>
        <span className={`${styles.status} ${statusClass}`}>{data.status}</span>
      </div>
      <h3 className={styles.restaurant}>{data.restaurant}</h3>
      <div className={styles.details}>
        <span>{data.date}</span>
        <span className={styles.sep}>&middot;</span>
        <span>{data.preferredTimes}</span>
      </div>
      <div className={styles.progress}>
        {data.pollCount} / {data.maxAttempts} attempts
      </div>
    </div>
  );
});
