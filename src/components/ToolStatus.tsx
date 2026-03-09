import styles from "./ToolStatus.module.css";

interface Props {
  label: string;
  completedTools?: string[];
}

export function ToolStatus({ label, completedTools = [] }: Props) {
  return (
    <div className={styles.container}>
      {completedTools.map((tool, i) => (
        <div key={i} className={styles.completed}>
          <span className={styles.check}>&#10003;</span>
          <span className={styles.completedLabel}>{tool}</span>
        </div>
      ))}
      <div className={styles.wrapper}>
        <span className={styles.dot} />
        <span className={styles.dot} />
        <span className={styles.dot} />
        <span className={styles.label}>{label}</span>
      </div>
    </div>
  );
}
