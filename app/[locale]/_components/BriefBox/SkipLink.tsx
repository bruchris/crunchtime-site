"use client";
import styles from "./briefBox.module.css";

export function SkipLink({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button type="button" className={styles.skipLink} onClick={onClick}>
      {label}
    </button>
  );
}
