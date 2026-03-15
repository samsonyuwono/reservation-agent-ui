import styles from "./ResyLogo.module.css";

interface Props {
  subtitle?: string;
  size?: "sm" | "lg";
}

export function ResyLogo({ subtitle, size = "sm" }: Props) {
  return (
    <span className={`${styles.logo} ${size === "lg" ? styles.lg : ""}`}>
      <span className={styles.badge}>RESY</span>
      {subtitle && <span className={styles.sub}>{subtitle}</span>}
    </span>
  );
}
