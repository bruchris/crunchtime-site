import styles from "./briefBox.module.css";
import { ToolList, type ToolState } from "./ToolList";
import type { Agent } from "../../../_lib/briefSchema";

export function AgentCard({
  agent,
  visible,
  spawningLabel,
  toolStates,
  connectingLabel,
  connectedLabel
}: {
  agent: Agent;
  visible: boolean;
  spawningLabel: string;
  toolStates: ToolState[];
  connectingLabel: string;
  connectedLabel: string;
}) {
  return (
    <article className={`${styles.agentCard} ${visible ? styles.visible : ""}`}>
      <div className={styles.agentName}>
        <span className={`${styles.agentDot} ${styles[agent.color]}`} aria-hidden />
        {agent.name}
      </div>
      <div className={styles.agentSpawning}>{spawningLabel}</div>
      <ToolList
        tools={agent.tools}
        states={toolStates}
        connectingLabel={connectingLabel}
        connectedLabel={connectedLabel}
      />
    </article>
  );
}
