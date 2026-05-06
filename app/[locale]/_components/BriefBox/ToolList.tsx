import styles from "./briefBox.module.css";

export type ToolState = "idle" | "connecting" | "connected";

export function ToolList({
  tools,
  states,
  connectingLabel,
  connectedLabel
}: {
  tools: string[];
  states: ToolState[];
  connectingLabel: string;
  connectedLabel: string;
}) {
  return (
    <ul className={styles.toolList} aria-label="tools">
      {tools.map((tool, i) => {
        const s = states[i] ?? "idle";
        const cls =
          s === "connected"
            ? `${styles.toolPill} ${styles.connected}`
            : s === "connecting"
              ? `${styles.toolPill} ${styles.connecting}`
              : styles.toolPill;
        return (
          <li key={tool} className={cls}>
            {tool}
            {s === "connected" && <span className={styles.toolSuffix}>{connectedLabel}</span>}
            {s === "connecting" && <span className={styles.toolSuffix}>{connectingLabel}</span>}
          </li>
        );
      })}
    </ul>
  );
}
