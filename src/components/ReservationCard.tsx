import type { ReservationCardData } from "../api/types";
import styles from "./ReservationCard.module.css";

interface Props {
  data: ReservationCardData;
}

export function ReservationCard({ data }: Props) {
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
        <div className={styles.confirmation}>
          #{data.confirmationNumber}
        </div>
      )}
    </div>
  );
}
