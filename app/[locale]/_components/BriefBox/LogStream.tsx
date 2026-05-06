import styles from "./briefBox.module.css";
import type { LogLine } from "../../../_lib/briefSchema";

export function LogStream({
  logs,
  visibleCount
}: {
  logs: LogLine[];
  visibleCount: number;
}) {
  return (
    <div className={styles.logFeed}>
      {logs.map((log, i) => (
        <div
          key={i}
          className={`${styles.logLine} ${i < visibleCount ? styles.visible : ""}`}
        >
          <span className={styles.logTs}>{log.ts}</span>
          <span>
            <span className={styles.logAgent}>{log.agent}</span> · {log.action}
          </span>
        </div>
      ))}
    </div>
  );
}
