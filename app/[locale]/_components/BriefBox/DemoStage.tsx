"use client";

import { useEffect, useMemo, useReducer, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import styles from "./briefBox.module.css";
import { BriefInput } from "./BriefInput";
import { ChipRow } from "./ChipRow";
import { TeamPanel } from "./TeamPanel";
import { EndCard } from "./EndCard";
import { SkipLink } from "./SkipLink";
import { StatusPill } from "./StatusPill";
import {
  createDemoScheduler,
  type DemoEvent,
  type DemoPhase
} from "../../../_lib/demoScheduler";
import type { BriefResponse } from "../../../_lib/briefSchema";

type ToolState = "idle" | "connecting" | "connected";

interface Props {
  lang: "no" | "en";
}

interface DemoState {
  phase: DemoPhase;
  agentsVisible: boolean[];
  toolStates: ToolState[][];
  logsVisible: number;
}

type Action =
  | { type: "reset"; payload: BriefResponse }
  | { type: "event"; event: DemoEvent };

function initialFor(payload: BriefResponse | null): DemoState {
  if (!payload) {
    return { phase: "idle", agentsVisible: [], toolStates: [], logsVisible: 0 };
  }
  return {
    phase: "idle",
    agentsVisible: payload.agents.map(() => false),
    toolStates: payload.agents.map((a) => a.tools.map(() => "idle" as ToolState)),
    logsVisible: 0
  };
}

function reducer(state: DemoState, action: Action): DemoState {
  if (action.type === "reset") return initialFor(action.payload);
  const e = action.event;
  switch (e.type) {
    case "phase":
      return { ...state, phase: e.phase };
    case "agent-spawn": {
      const next = [...state.agentsVisible];
      next[e.index] = true;
      return { ...state, agentsVisible: next };
    }
    case "tool-connect": {
      const next = state.toolStates.map((row) => [...row]);
      // Mark directly as connected (scheduler emits tool-connect as the final state).
      next[e.agentIndex][e.toolIndex] = "connected";
      return { ...state, toolStates: next };
    }
    case "log-line":
      return { ...state, logsVisible: Math.max(state.logsVisible, e.index + 1) };
    default:
      return state;
  }
}

export function DemoStage({ lang }: Props) {
  const t = useTranslations("briefBox");
  // Lifted to top to satisfy rules-of-hooks (used in throttled branch below).
  const tEnd = useTranslations("endCard");

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [brief, setBrief] = useState("");
  const [payload, setPayload] = useState<BriefResponse | null>(null);
  const [throttled, setThrottled] = useState(false);
  const [state, dispatch] = useReducer(reducer, initialFor(null));
  const schedulerRef = useRef<ReturnType<typeof createDemoScheduler> | null>(null);

  const reducedMotion = useMemo(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  // Cancel scheduler on unmount.
  useEffect(() => {
    return () => {
      schedulerRef.current?.cancel();
    };
  }, []);

  // Auto-scroll on mobile as new content lands.
  useEffect(() => {
    if (typeof window === "undefined" || reducedMotion) return;
    if (window.innerWidth >= 768) return;
    if (state.phase === "idle") return;
    window.scrollTo({ top: document.body.scrollHeight * 0.5, behavior: "smooth" });
  }, [state.phase, state.logsVisible, reducedMotion]);

  async function handleSubmit(text: string) {
    if (submitting) return;

    // Cancel any in-progress scheduler before starting a new run.
    schedulerRef.current?.cancel();
    schedulerRef.current = null;

    setSubmitting(true);
    setSubmitted(true);
    setBrief(text);
    setThrottled(false);

    try {
      const res = await fetch("/api/brief", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ brief: text, lang })
      });
      if (res.status === 429 || !res.ok) {
        setThrottled(true);
        setSubmitting(false);
        return;
      }
      const data = (await res.json()) as BriefResponse;
      setPayload(data);
      dispatch({ type: "reset", payload: data });
      const sched = createDemoScheduler(data, {
        reducedMotion,
        onEvent: (event) => dispatch({ type: "event", event })
      });
      schedulerRef.current = sched;
      sched.start();
    } catch (err) {
      console.error("[DemoStage] fetch /api/brief failed", err);
      // Network error: treat as rate-limited to show the graceful fallback.
      setThrottled(true);
    } finally {
      setSubmitting(false);
    }
  }

  function handleSkip() {
    schedulerRef.current?.skip();
  }

  if (throttled) {
    return (
      <section className={styles.shell}>
        <StatusPill label={t("statusLive")} />
        <h1 className={styles.headline}>{t("headline")}</h1>
        <p className={styles.subline}>{t("rateLimited")}</p>
        <a
          className={styles.ctaPrimary}
          href={process.env.NEXT_PUBLIC_CAL_BOOKING_LINK || `/${lang}/contact`}
        >
          {tEnd("ctaBook")}
        </a>
      </section>
    );
  }

  const showSkip =
    submitted && state.phase !== "idle" && state.phase !== "end-card";

  return (
    <section className={styles.shell}>
      {showSkip && <SkipLink label={t("skip")} onClick={handleSkip} />}
      <StatusPill label={t("statusLive")} />
      <h1 className={`${styles.headline} ${submitted ? styles.headlineCollapsed : ""}`}>
        {t.rich("headline", {
          accent: (chunks) => <span className={styles.accent}>{chunks}</span>
        })}
      </h1>
      {!submitted && <p className={styles.subline}>{t("subline")}</p>}

      <BriefInput
        dimmed={submitting || submitted}
        analyzing={submitting && !payload}
        onSubmit={handleSubmit}
        noscriptAction="/api/brief-noscript"
        lang={lang}
      />
      <ChipRow hidden={submitted} onPick={handleSubmit} />

      {payload && (
        <div className={styles.stage}>
          <TeamPanel
            payload={payload}
            agentsVisible={state.agentsVisible}
            visibleCount={state.logsVisible}
            forceDone={state.phase === "end-card"}
          />
          <EndCard
            visible={state.phase === "end-card"}
            brief={brief}
            payload={payload}
            lang={lang}
          />
        </div>
      )}
    </section>
  );
}
