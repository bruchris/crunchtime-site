"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import styles from "./briefBox.module.css";
import type { ActivityType, Agent, BriefResponse, LogLine } from "../../../_lib/briefSchema";

interface Props {
  payload: BriefResponse;
  agentsVisible: boolean[];
  visibleCount: number;
  /** When true, force all cards to "done" immediately (e.g. on skip-to-end). */
  forceDone?: boolean;
}

interface CardData {
  index: number;
  log: LogLine;
  id: string;
  kind: ActivityType;
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

function defaultKind(action: string): ActivityType {
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

export function TeamPanel({ payload, agentsVisible, visibleCount, forceDone }: Props) {
  const t = useTranslations("briefBox");
  const [selected, setSelected] = useState<number | "all">("all");

  // Detect reduced-motion preference once (client-only, safe in useEffect).
  const prefersReducedMotion = useRef(false);
  useEffect(() => {
    if (typeof window !== "undefined") {
      prefersReducedMotion.current = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
    }
  }, []);

  // Track per-card status: "running" (spinner visible) or "done" (ring gone).
  const [cardStatus, setCardStatus] = useState<Record<string, "running" | "done">>({});
  // Keep a ref of the previous visible id set so we can detect newly-arrived cards.
  const prevVisibleIds = useRef<Set<string>>(new Set());

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

  // When new cards arrive, enqueue them as "running" then settle to "done" after
  // a random delay (2500–8000ms). Uses a ref-tracked id set to handle Strict Mode
  // double-effect idempotently (timer ids cleaned up on re-run).
  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    if (prefersReducedMotion.current || forceDone) {
      // Skip animation: mark everything done immediately.
      setCardStatus((prev) => {
        const next: Record<string, "running" | "done"> = { ...prev };
        for (const card of visibleCards) next[card.id] = "done";
        return next;
      });
      prevVisibleIds.current = new Set(visibleCards.map((c) => c.id));
      return;
    }

    const newIds: string[] = [];
    for (const card of visibleCards) {
      if (!prevVisibleIds.current.has(card.id)) {
        newIds.push(card.id);
      }
    }

    if (newIds.length > 0) {
      setCardStatus((prev) => {
        const next = { ...prev };
        for (const id of newIds) {
          // Only set to running if not already tracked (idempotent under double-effect).
          if (!next[id]) next[id] = "running";
        }
        return next;
      });

      for (const id of newIds) {
        // Per-card random duration: 2500–8000ms. Each card spins independently
        // so the feed feels like real work happening at different speeds.
        const delay = 2500 + Math.random() * 5500;
        const t = setTimeout(() => {
          setCardStatus((prev) => ({ ...prev, [id]: "done" }));
        }, delay);
        timers.push(t);
      }
    }

    prevVisibleIds.current = new Set(visibleCards.map((c) => c.id));

    return () => {
      for (const t of timers) clearTimeout(t);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visibleCount, forceDone]);

  // When forceDone flips to true, immediately settle any still-running cards.
  useEffect(() => {
    if (!forceDone) return;
    setCardStatus((prev) => {
      const next: Record<string, "running" | "done"> = { ...prev };
      for (const id of Object.keys(next)) next[id] = "done";
      return next;
    });
  }, [forceDone]);

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
              const status = cardStatus[card.id] ?? "running";
              const isRunning = status === "running";
              return (
                <li key={card.id} className={styles.feedCard} data-kind={card.kind}>
                  <div className={styles.cardHeader}>
                    <span className={styles.cardStatusWrap} aria-hidden>
                      <span className={styles.cardStatus} />
                      <span
                        className={styles.cardStatusRing}
                        data-running={isRunning}
                        aria-hidden
                      />
                    </span>
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
                    {isRunning ? "…" : `${(card.tokens / 1000).toFixed(1)}k tok`}
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
