"use client";

import { useEffect, useReducer, useRef, useState } from "react";
import type { JSX } from "react";

type AgentId = "sales" | "back-office" | "copy" | "support" | "analyst";

type TaskType = "Assignment" | "Automation";

type Task = {
  id: string;
  title: string;
  type: TaskType;
  tokens: number;
};

type Agent = {
  id: AgentId;
  name: string;
  role: string;
  Icon: () => JSX.Element;
};

type AgentState = {
  running: Task[];
  queued: Task[];
  doneToday: number;
  hasIssue: boolean;
};

type FeedEvent = {
  key: string;
  agentId: AgentId;
  kind: "complete" | "issue" | "resolve";
  task: Task;
  tickIndex: number;
};

type SimState = {
  agents: Record<AgentId, AgentState>;
  feed: FeedEvent[];
  tickIndex: number;
};

type Action =
  | { kind: "complete"; agentId: AgentId; nextQueued: Task }
  | { kind: "issue"; agentId: AgentId }
  | { kind: "resolve"; agentId: AgentId };

const TICK_MS = 2400;
const FAKE_MINUTES_PER_TICK = 11;
const FEED_LIMIT = 7;

const TrendingUpIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
    <polyline points="16 7 22 7 22 13" />
  </svg>
);

const BriefcaseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="2" y="7" width="20" height="14" rx="2" />
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
  </svg>
);

const PenIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 19l7-7 3 3-7 7-3-3z" />
    <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
    <path d="M2 2l7.586 7.586" />
  </svg>
);

const HeadphonesIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
    <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3z" />
    <path d="M3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
  </svg>
);

const BarChartIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <line x1="12" y1="20" x2="12" y2="10" />
    <line x1="18" y1="20" x2="18" y2="4" />
    <line x1="6" y1="20" x2="6" y2="16" />
  </svg>
);

const PlusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const agents: Agent[] = [
  { id: "sales", name: "Sales Rep", role: "Pipeline", Icon: TrendingUpIcon },
  { id: "back-office", name: "Back-Office", role: "Finance", Icon: BriefcaseIcon },
  { id: "copy", name: "Copywriter", role: "Content", Icon: PenIcon },
  { id: "support", name: "Support", role: "Customers", Icon: HeadphonesIcon },
  { id: "analyst", name: "Analyst", role: "Reporting", Icon: BarChartIcon }
];

const initialState: SimState = {
  agents: {
    sales: {
      running: [
        { id: "f3a8c1d2", title: "Send **Q2 proposal** to Acme Corp", type: "Assignment", tokens: 7.9 }
      ],
      queued: [
        { id: "8b29ef41", title: "Qualify lead from **contact form**", type: "Assignment", tokens: 3.4 },
        { id: "1c5d6a07", title: "Follow up: 12 **cold prospects**", type: "Automation", tokens: 8.2 },
        { id: "9e4b2c80", title: "Book demo with **Anna Karenina**", type: "Assignment", tokens: 2.1 }
      ],
      doneToday: 4,
      hasIssue: false
    },
    "back-office": {
      running: [
        { id: "a721ce04", title: "Reconcile **14 March expenses**", type: "Automation", tokens: 6.7 }
      ],
      queued: [
        { id: "55b81e92", title: "Process **7 invoices** to Tripletex", type: "Automation", tokens: 11.4 },
        { id: "0fe2dd61", title: "Audit **subscription renewals**", type: "Automation", tokens: 5.8 },
        { id: "47a39c12", title: "Export **Q1 P&L** to drive", type: "Automation", tokens: 9.0 }
      ],
      doneToday: 6,
      hasIssue: false
    },
    copy: {
      running: [
        { id: "d042ba35", title: "Post **3 LinkedIn drafts**", type: "Assignment", tokens: 4.2 }
      ],
      queued: [
        { id: "c1ff8e76", title: "Draft **Q2 newsletter**", type: "Assignment", tokens: 5.6 },
        { id: "7a604b88", title: "Tighten **landing page hero**", type: "Assignment", tokens: 3.1 }
      ],
      doneToday: 3,
      hasIssue: false
    },
    support: {
      running: [
        { id: "e0892a14", title: "Resolve **order #4421** (refund)", type: "Assignment", tokens: 5.3 }
      ],
      queued: [
        { id: "b3759cd1", title: "Reply to **5 tickets**", type: "Automation", tokens: 9.7 },
        { id: "2d44ee05", title: "Update FAQ: **refund window**", type: "Assignment", tokens: 4.4 }
      ],
      doneToday: 9,
      hasIssue: false
    },
    analyst: {
      running: [
        { id: "6c01f3a8", title: "Publish **weekly performance report**", type: "Automation", tokens: 12.3 }
      ],
      queued: [
        { id: "ab3f7e10", title: "Summarize **5 Slack standups**", type: "Automation", tokens: 7.5 },
        { id: "f99d1c44", title: "Refresh **CRM dashboard**", type: "Automation", tokens: 6.0 }
      ],
      doneToday: 5,
      hasIssue: false
    }
  },
  feed: [],
  tickIndex: 0
};

const script: Action[] = [
  { kind: "complete", agentId: "copy", nextQueued: { id: "ec88a201", title: "Repurpose **webinar to thread**", type: "Assignment", tokens: 6.4 } },
  { kind: "complete", agentId: "back-office", nextQueued: { id: "70bc4f55", title: "Categorize **23 receipts**", type: "Automation", tokens: 4.9 } },
  { kind: "complete", agentId: "sales", nextQueued: { id: "31a002fe", title: "Refresh **HubSpot stages**", type: "Automation", tokens: 5.2 } },
  { kind: "complete", agentId: "analyst", nextQueued: { id: "82b71d09", title: "Compile **board summary deck**", type: "Automation", tokens: 8.8 } },
  { kind: "issue", agentId: "support" },
  { kind: "complete", agentId: "copy", nextQueued: { id: "06ae22c1", title: "Edit **case study draft**", type: "Assignment", tokens: 5.0 } },
  { kind: "complete", agentId: "back-office", nextQueued: { id: "f1c5d4be", title: "Match **vendor payments**", type: "Automation", tokens: 7.1 } },
  { kind: "complete", agentId: "analyst", nextQueued: { id: "29ea6173", title: "Tag **anomalies** in cash flow", type: "Automation", tokens: 6.7 } },
  { kind: "resolve", agentId: "support" },
  { kind: "complete", agentId: "sales", nextQueued: { id: "73f08aa9", title: "Send **renewal reminder** to 4 customers", type: "Automation", tokens: 4.0 } },
  { kind: "complete", agentId: "support", nextQueued: { id: "55c721ea", title: "Triage **3 escalated tickets**", type: "Assignment", tokens: 6.8 } },
  { kind: "complete", agentId: "copy", nextQueued: { id: "9e4407dd", title: "Draft **product launch post**", type: "Assignment", tokens: 7.2 } },
  { kind: "complete", agentId: "analyst", nextQueued: { id: "ba12f056", title: "Pull **conversion funnel** report", type: "Automation", tokens: 9.4 } },
  { kind: "complete", agentId: "back-office", nextQueued: { id: "44d8e09b", title: "Reconcile **Stripe payouts**", type: "Automation", tokens: 8.3 } }
];

function reducer(state: SimState, action: { type: "tick" }): SimState {
  if (action.type !== "tick") return state;
  const next: SimState = {
    agents: { ...state.agents },
    feed: state.feed,
    tickIndex: state.tickIndex + 1
  };
  const op = script[state.tickIndex % script.length];
  const agent = next.agents[op.agentId];
  let event: FeedEvent | null = null;

  if (op.kind === "complete") {
    if (agent.running.length === 0) return state;
    const finished = agent.running[0];
    const remainingRunning = agent.running.slice(1);
    const promoted = agent.queued[0];
    const remainingQueued = agent.queued.slice(1);
    next.agents[op.agentId] = {
      running: promoted ? [promoted, ...remainingRunning] : remainingRunning,
      queued: [...remainingQueued, op.nextQueued],
      doneToday: agent.doneToday + 1,
      hasIssue: false
    };
    event = {
      key: `${next.tickIndex}-${finished.id}`,
      agentId: op.agentId,
      kind: "complete",
      task: finished,
      tickIndex: next.tickIndex
    };
  } else if (op.kind === "issue") {
    next.agents[op.agentId] = { ...agent, hasIssue: true };
    const flagged = agent.running[0] ?? agent.queued[0];
    if (flagged) {
      event = {
        key: `${next.tickIndex}-issue-${flagged.id}`,
        agentId: op.agentId,
        kind: "issue",
        task: { ...flagged, title: "Customer escalation, needs human review" },
        tickIndex: next.tickIndex
      };
    }
  } else if (op.kind === "resolve") {
    next.agents[op.agentId] = { ...agent, hasIssue: false };
    const recovered = agent.running[0] ?? agent.queued[0];
    if (recovered) {
      event = {
        key: `${next.tickIndex}-resolve-${recovered.id}`,
        agentId: op.agentId,
        kind: "resolve",
        task: { ...recovered, title: "Escalation routed to Anna, resolved" },
        tickIndex: next.tickIndex
      };
    }
  }

  next.feed = event ? [event, ...state.feed].slice(0, FEED_LIMIT) : state.feed;
  return next;
}

function relativeAgo(eventTick: number, currentTick: number): string {
  const ticks = currentTick - eventTick;
  if (ticks <= 0) return "just now";
  const minutes = ticks * FAKE_MINUTES_PER_TICK;
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function formatTokens(value: number): string {
  return `${value.toFixed(1)}k tok`;
}

function renderTitle(title: string): JSX.Element[] {
  const parts = title.split(/(\*\*[^*]+\*\*)/);
  return parts
    .filter((p) => p.length > 0)
    .map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={i}>{part.slice(2, -2)}</strong>;
      }
      return <span key={i}>{part}</span>;
    });
}

function totalRunning(state: SimState, agentId: AgentId): number {
  return state.agents[agentId].running.length;
}

export function Newsroom() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [state, dispatch] = useReducer(reducer, initialState);
  const [selectedAgentId, setSelectedAgentId] = useState<AgentId | null>(null);
  const [staticMode, setStaticMode] = useState(false);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      setStaticMode(true);
      for (let i = 0; i < 8; i++) dispatch({ type: "tick" });
      return;
    }

    const section = sectionRef.current;
    if (!section) return;

    let interval: ReturnType<typeof setInterval> | null = null;

    const start = () => {
      if (interval) return;
      dispatch({ type: "tick" });
      interval = setInterval(() => dispatch({ type: "tick" }), TICK_MS);
    };
    const stop = () => {
      if (!interval) return;
      clearInterval(interval);
      interval = null;
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) start();
        else stop();
      },
      { threshold: 0.2 }
    );
    observer.observe(section);

    const onVisibility = () => {
      if (document.hidden) stop();
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      stop();
    };
  }, []);

  const selectedAgent = selectedAgentId ? state.agents[selectedAgentId] : null;

  return (
    <section
      ref={sectionRef}
      id="agents"
      className="newsroom mx-auto max-w-7xl px-5 py-24 sm:px-8"
      data-mode={staticMode ? "static" : "live"}
    >
      <div className="max-w-3xl">
        <p className="eyebrow">Live right now</p>
        <h2 className="section-title mt-4">A business that keeps moving.</h2>
        <p className="mt-6 max-w-xl text-lg leading-7 text-[var(--color-muted)]">
          A real Crunchtime agent team in motion. Click an agent to see what they are running.
        </p>
      </div>

      <div className="newsroom-shell mt-12">
        <aside className="newsroom-rail" aria-label="Agents">
          <header className="newsroom-rail-header">
            <span>Agents</span>
            <button
              type="button"
              className="newsroom-rail-add"
              aria-label="Add agent"
              tabIndex={-1}
            >
              <PlusIcon />
            </button>
          </header>
          <ul>
            <li>
              <button
                type="button"
                className="newsroom-agent-row"
                data-selected={selectedAgentId === null}
                onClick={() => setSelectedAgentId(null)}
              >
                <span className="newsroom-agent-icon" aria-hidden="true">
                  <BarChartIcon />
                </span>
                <span className="newsroom-agent-name">All activity</span>
              </button>
            </li>
            {agents.map((a) => {
              const live = totalRunning(state, a.id);
              const hasIssue = state.agents[a.id].hasIssue;
              return (
                <li key={a.id}>
                  <button
                    type="button"
                    className="newsroom-agent-row"
                    data-selected={selectedAgentId === a.id}
                    data-issue={hasIssue}
                    onClick={() => setSelectedAgentId(a.id)}
                  >
                    <span className="newsroom-agent-icon" aria-hidden="true">
                      <a.Icon />
                    </span>
                    <span className="newsroom-agent-name">{a.name}</span>
                    {hasIssue ? (
                      <span className="newsroom-agent-pill" data-tone="warn">
                        <span className="newsroom-pill-dot" />
                        issue
                      </span>
                    ) : live > 0 ? (
                      <span className="newsroom-agent-pill">
                        <span className="newsroom-pill-dot" />
                        {live} live
                      </span>
                    ) : null}
                  </button>
                </li>
              );
            })}
          </ul>
        </aside>

        <div className="newsroom-panel">
          {selectedAgent && selectedAgentId ? (
            <AgentDetail
              agent={agents.find((a) => a.id === selectedAgentId)!}
              state={selectedAgent}
              tickIndex={state.tickIndex}
              feed={state.feed.filter((e) => e.agentId === selectedAgentId)}
            />
          ) : (
            <ActivityList feed={state.feed} tickIndex={state.tickIndex} />
          )}
        </div>
      </div>
    </section>
  );
}

function ActivityList({ feed, tickIndex }: { feed: FeedEvent[]; tickIndex: number }) {
  return (
    <>
      <header className="newsroom-panel-header">
        <span className="newsroom-panel-title">Activity</span>
        <span className="newsroom-panel-meta">
          <span className="newsroom-live-dot" aria-hidden="true" />
          live
        </span>
      </header>
      <ol className="newsroom-cards">
        {feed.length === 0 ? (
          <li className="newsroom-empty">Warming up.</li>
        ) : (
          feed.map((event) => (
            <TaskCard key={event.key} event={event} tickIndex={tickIndex} agentName={agents.find((a) => a.id === event.agentId)?.name ?? ""} />
          ))
        )}
      </ol>
    </>
  );
}

function AgentDetail({
  agent,
  state,
  tickIndex,
  feed
}: {
  agent: Agent;
  state: AgentState;
  tickIndex: number;
  feed: FeedEvent[];
}) {
  return (
    <>
      <header className="newsroom-panel-header">
        <span className="newsroom-panel-title">
          {agent.name} <span className="newsroom-panel-role">/ {agent.role}</span>
        </span>
        <span className="newsroom-panel-meta">
          {state.doneToday} done today
        </span>
      </header>

      <div className="newsroom-section-label">Running ({state.running.length})</div>
      <ol className="newsroom-cards">
        {state.running.map((task) => (
          <li key={task.id} className="newsroom-card-row" data-state={state.hasIssue ? "issue" : "running"}>
            <span className="newsroom-status-dot" aria-hidden="true" />
            <div className="newsroom-card-body">
              <div className="newsroom-card-meta-row">
                <span className="newsroom-hash font-mono">{task.id}</span>
                <span className="newsroom-type-badge" data-type={task.type}>{task.type}</span>
                <span className="newsroom-card-time">{state.hasIssue ? "needs review" : "running"}</span>
              </div>
              <p className="newsroom-card-title">
                {state.hasIssue ? <em>Customer escalation, needs human review</em> : renderTitle(task.title)}
              </p>
              <p className="newsroom-card-tokens font-mono">{formatTokens(task.tokens)}</p>
            </div>
          </li>
        ))}
        {state.running.length === 0 ? <li className="newsroom-empty">Idle.</li> : null}
      </ol>

      <div className="newsroom-section-label newsroom-section-label--muted">Queued ({state.queued.length})</div>
      <ol className="newsroom-cards">
        {state.queued.map((task) => (
          <li key={task.id} className="newsroom-card-row" data-state="queued">
            <span className="newsroom-status-dot" aria-hidden="true" />
            <div className="newsroom-card-body">
              <div className="newsroom-card-meta-row">
                <span className="newsroom-hash font-mono">{task.id}</span>
                <span className="newsroom-type-badge" data-type={task.type}>{task.type}</span>
                <span className="newsroom-card-time">queued</span>
              </div>
              <p className="newsroom-card-title">{renderTitle(task.title)}</p>
              <p className="newsroom-card-tokens font-mono">{formatTokens(task.tokens)}</p>
            </div>
          </li>
        ))}
        {state.queued.length === 0 ? <li className="newsroom-empty">No queue.</li> : null}
      </ol>

      {feed.length > 0 ? (
        <>
          <div className="newsroom-section-label newsroom-section-label--muted">Recent</div>
          <ol className="newsroom-cards">
            {feed.slice(0, 4).map((event) => (
              <TaskCard key={event.key} event={event} tickIndex={tickIndex} agentName="" compact />
            ))}
          </ol>
        </>
      ) : null}
    </>
  );
}

function TaskCard({
  event,
  tickIndex,
  agentName,
  compact
}: {
  event: FeedEvent;
  tickIndex: number;
  agentName: string;
  compact?: boolean;
}) {
  const ago = relativeAgo(event.tickIndex, tickIndex);
  const dataState = event.kind === "issue" ? "issue" : event.kind === "resolve" ? "resolve" : "done";
  return (
    <li className="newsroom-card-row" data-state={dataState} data-fresh={tickIndex === event.tickIndex ? "true" : "false"}>
      <span className="newsroom-status-dot" aria-hidden="true" />
      <div className="newsroom-card-body">
        <div className="newsroom-card-meta-row">
          <span className="newsroom-hash font-mono">{event.task.id}</span>
          <span className="newsroom-type-badge" data-type={event.task.type}>{event.task.type}</span>
          <span className="newsroom-card-time">{ago}</span>
        </div>
        <p className="newsroom-card-title">
          {!compact && agentName ? <span className="newsroom-card-agent">{agentName} </span> : null}
          {renderTitle(event.task.title)}
        </p>
        <p className="newsroom-card-tokens font-mono">{formatTokens(event.task.tokens)}</p>
      </div>
    </li>
  );
}
