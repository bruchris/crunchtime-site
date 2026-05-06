import styles from "./briefBox.module.css";

export function StatusPill({ label }: { label: string }) {
  return (
    <div className={styles.statusPill}>
      <span className={styles.statusDot} aria-hidden />
      <span>{label}</span>
    </div>
  );
}
