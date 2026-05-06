"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import styles from "./briefBox.module.css";
import type { Agent, BriefResponse, LogLine } from "../../../_lib/briefSchema";

interface Props {
  payload: BriefResponse;
  agentsVisible: boolean[];
  visibleCount: number;
}

type ActivityKind = "assignment" | "automation" | "issue";

interface CardData {
  index: number;
  log: LogLine;
  id: string;
  kind: ActivityKind;
  tokens: number;
  agentIndex: number;
  agent: Agent;
}

const COLOR_CLASS: Record<Agent["color"], string> = {
  lime: styles.lime,
  blue: styles.blue,
  amber: styles.amber,
  violet: styles.violet,
  cyan: styles.cyan
};

// Cheap deterministic 8-char hex hash for the card id chip.
function shortHash(input: string): string {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h.toString(16).padStart(8, "0").slice(0, 8);
}

function defaultKind(action: string): ActivityKind {
  const a = action.toLowerCase();
  if (/(flagg|alert|warn|missing|stuck|over \d|>\d|>30|>60|escalat|mangle|feilet|failed)/.test(a)) {
    return "issue";
  }
  if (/(skrev|drafted|sent|posted|wrote|created|booket|booked|scheduled|sendte|opprett)/.test(a)) {
    return "assignment";
  }
  return "automation";
}

function defaultTokens(action: string, idx: number): number {
  // Pseudo-stable based on action length + index, range 1.4k–14k.
  const seed = action.length * 137 + idx * 911;
  return 1400 + (seed % 12600);
}

function timeAgo(_ts: string, idxFromEnd: number): string {
  if (idxFromEnd === 0) return "just now";
  if (idxFromEnd === 1) return "1m ago";
  return `${Math.min(99, idxFromEnd)}m ago`;
}

export function TeamPanel({ payload, agentsVisible, visibleCount }: Props) {
  const t = useTranslations("briefBox");
  const [selected, setSelected] = useState<number | "all">("all");

  const allCards = useMemo<CardData[]>(() => {
    return payload.logs.map((log, i) => {
      const agentIndex = Math.max(
        0,
        payload.agents.findIndex((a) => a.name === log.agent)
      );
      const agent = payload.agents[agentIndex];
      return {
        index: i,
        log,
        id: shortHash(`${log.agent}:${log.ts}:${log.action}:${i}`),
        kind: log.type ?? defaultKind(log.action),
        tokens: log.tokens ?? defaultTokens(log.action, i),
        agentIndex,
        agent
      };
    });
  }, [payload]);

  const visibleCards = allCards.slice(0, visibleCount);

  // Per-agent live counts (visible cards by agent index).
  const liveByAgent = useMemo(() => {
    const counts = new Array(payload.agents.length).fill(0) as number[];
    for (const card of visibleCards) counts[card.agentIndex]++;
    return counts;
  }, [visibleCards, payload.agents.length]);

  // Detect issues per agent so the rail can show an issue badge.
  const issueByAgent = useMemo(() => {
    const flags = new Array(payload.agents.length).fill(false) as boolean[];
    for (const card of visibleCards) if (card.kind === "issue") flags[card.agentIndex] = true;
    return flags;
  }, [visibleCards, payload.agents.length]);

  const filteredCards =
    selected === "all"
      ? visibleCards
      : visibleCards.filter((c) => c.agentIndex === selected);

  return (
    <div className={styles.teamPanel}>
      <aside className={styles.rail}>
        <div className={styles.railHeader}>{t("railTitle")}</div>
        <ul className={styles.railList}>
          <li>
            <button
              type="button"
              data-selected={selected === "all"}
              className={styles.railRow}
              onClick={() => setSelected("all")}
            >
              <span className={styles.railIcon} aria-hidden>▦</span>
              <span className={styles.railName}>{t("railAll")}</span>
              <span className={styles.railCount}>{visibleCards.length}</span>
            </button>
          </li>
          {payload.agents.map((agent, i) => {
            const visible = agentsVisible[i] ?? false;
            const live = liveByAgent[i];
            const hasIssue = issueByAgent[i];
            return (
              <li key={agent.name}>
                <button
                  type="button"
                  data-selected={selected === i}
                  data-visible={visible}
                  className={styles.railRow}
                  onClick={() => setSelected(i)}
                  disabled={!visible}
                >
                  <span
                    className={`${styles.railDot} ${COLOR_CLASS[agent.color]}`}
                    aria-hidden
                  />
                  <span className={styles.railName}>{agent.name}</span>
                  {hasIssue ? (
                    <span className={`${styles.railPill} ${styles.railPillIssue}`}>
                      {t("pillIssue")}
                    </span>
                  ) : live > 0 ? (
                    <span className={styles.railPill}>
                      {t("pillLive", { count: live })}
                    </span>
                  ) : visible ? (
                    <span className={styles.railPillIdle}>{t("pillIdle")}</span>
                  ) : (
                    <span className={styles.railPillIdle}>...</span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </aside>
      <section className={styles.feed}>
        <header className={styles.feedHeader}>
          <span className={styles.feedTitle}>{t("activityTitle")}</span>
          <span className={styles.feedLive}>
            <span className={styles.feedLiveDot} aria-hidden />
            {t("activityLive")}
          </span>
        </header>
        <ul className={styles.feedList}>
          {filteredCards
            .slice()
            .reverse()
            .map((card) => {
              const fromEnd = visibleCards.length - 1 - card.index;
              return (
                <li key={card.id} className={styles.feedCard} data-kind={card.kind}>
                  <div className={styles.cardHeader}>
                    <span className={styles.cardStatus} aria-hidden />
                    <span className={styles.cardId}>{card.id}</span>
                    <span className={`${styles.cardBadge} ${styles[`badge_${card.kind}`]}`}>
                      {t(`kind.${card.kind}`)}
                    </span>
                    <span className={styles.cardTime}>{timeAgo(card.log.ts, fromEnd)}</span>
                  </div>
                  <div className={styles.cardBody}>
                    <span
                      className={`${styles.cardAgentName} ${COLOR_CLASS[card.agent.color]}`}
                    >
                      {card.agent.name}
                    </span>
                    <span className={styles.cardAction}>{card.log.action}</span>
                  </div>
                  <div className={styles.cardMeta}>
                    {(card.tokens / 1000).toFixed(1)}k tok
                  </div>
                </li>
              );
            })}
          {filteredCards.length === 0 && (
            <li className={styles.feedEmpty}>{t("feedEmpty")}</li>
          )}
        </ul>
      </section>
    </div>
  );
}
