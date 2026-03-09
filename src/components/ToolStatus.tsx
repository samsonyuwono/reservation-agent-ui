import styles from "./ToolStatus.module.css";

interface Props {
  label: string;
}

export function ToolStatus({ label }: Props) {
  return (
    <div className={styles.wrapper}>
      <span className={styles.dot} />
      <span className={styles.dot} />
      <span className={styles.dot} />
      <span className={styles.label}>{label}</span>
    </div>
  );
}
