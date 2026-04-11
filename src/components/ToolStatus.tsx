import styles from "./ToolStatus.module.css";

interface Props {
  label?: string;
  completedTools?: string[];
}

export function ToolStatus({ label, completedTools = [] }: Props) {
  return (
    <div className={styles.container}>
      {completedTools.map((tool, i) => (
        <span key={i} className={styles.step}>
          {i > 0 && <span className={styles.arrow}>→</span>}
          <span className={styles.check}>&#10003;</span>
          <span className={styles.completedLabel}>{tool}</span>
        </span>
      ))}
      {label && (
        <span className={styles.step}>
          {completedTools.length > 0 && <span className={styles.arrow}>→</span>}
          <span className={styles.dot} />
          <span className={styles.dot} />
          <span className={styles.dot} />
          <span className={styles.label}>{label}</span>
        </span>
      )}
    </div>
  );
}
