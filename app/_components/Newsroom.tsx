"use client";

import { useEffect, useRef, useState } from "react";

type AgentId = "sales" | "back-office" | "copy" | "support" | "analyst";

type Task = {
  id: string;
  title: string;
  threshold: number;
};

type Agent = {
  id: AgentId;
  name: string;
  role: string;
  tone: string;
  tasks: Task[];
};

type FeedKind = "complete" | "issue" | "resolve";

type FeedEvent = {
  threshold: number;
  agentId: AgentId;
  kind: FeedKind;
  text: string;
};

const agents: Agent[] = [
  {
    id: "sales",
    name: "Sales Rep",
    role: "Pipeline",
    tone: "bg-lime-300",
    tasks: [
      { id: "T-204", title: "Send Q2 proposal to Acme Corp", threshold: 0.10 },
      { id: "T-208", title: "Qualify inbound lead from contact form", threshold: 0.34 },
      { id: "T-211", title: "Follow up: 12 cold prospects", threshold: 0.58 },
      { id: "T-217", title: "Book demo with Anna Karenina", threshold: 0.82 }
    ]
  },
  {
    id: "back-office",
    name: "Back-Office",
    role: "Finance",
    tone: "bg-blue-300",
    tasks: [
      { id: "T-145", title: "Reconcile 14 March expenses", threshold: 0.16 },
      { id: "T-149", title: "Process 7 invoices to Tripletex", threshold: 0.40 },
      { id: "T-152", title: "Audit subscription renewals", threshold: 0.65 },
      { id: "T-156", title: "Export Q1 P&L to drive", threshold: 0.88 }
    ]
  },
  {
    id: "copy",
    name: "Copywriter",
    role: "Content",
    tone: "bg-rose-300",
    tasks: [
      { id: "T-088", title: "Post 3 LinkedIn drafts", threshold: 0.06 },
      { id: "T-091", title: "Draft Q2 newsletter", threshold: 0.30 },
      { id: "T-094", title: "Tighten landing page hero copy", threshold: 0.52 },
      { id: "T-097", title: "Repurpose webinar to 8-tweet thread", threshold: 0.76 }
    ]
  },
  {
    id: "support",
    name: "Support",
    role: "Customers",
    tone: "bg-emerald-300",
    tasks: [
      { id: "T-302", title: "Resolve order #4421 (refund)", threshold: 0.20 },
      { id: "T-307", title: "Reply to 5 tickets", threshold: 0.46 },
      { id: "T-311", title: "Update FAQ: refund window", threshold: 0.70 },
      { id: "T-314", title: "Refund processed: order #4488", threshold: 0.92 }
    ]
  },
  {
    id: "analyst",
    name: "Analyst",
    role: "Reporting",
    tone: "bg-amber-300",
    tasks: [
      { id: "T-501", title: "Publish weekly performance report", threshold: 0.12 },
      { id: "T-504", title: "Summarize 5 Slack standups", threshold: 0.36 },
      { id: "T-507", title: "Refresh CRM dashboard", threshold: 0.62 },
      { id: "T-510", title: "Compile board summary deck", threshold: 0.86 }
    ]
  }
];

const feedEvents: FeedEvent[] = [
  { threshold: 0.06, agentId: "copy", kind: "complete", text: "Posted 3 LinkedIn drafts" },
  { threshold: 0.10, agentId: "sales", kind: "complete", text: "Sent Q2 proposal to Acme Corp" },
  { threshold: 0.12, agentId: "analyst", kind: "complete", text: "Published weekly performance report" },
  { threshold: 0.16, agentId: "back-office", kind: "complete", text: "Reconciled 14 March expenses" },
  { threshold: 0.20, agentId: "support", kind: "complete", text: "Resolved order #4421 (refund)" },
  { threshold: 0.24, agentId: "support", kind: "issue", text: "Customer escalation, needs human review" },
  { threshold: 0.30, agentId: "copy", kind: "complete", text: "Drafted Q2 newsletter, sent for approval" },
  { threshold: 0.34, agentId: "sales", kind: "complete", text: "Qualified inbound lead from contact form" },
  { threshold: 0.36, agentId: "analyst", kind: "complete", text: "Summarized 5 Slack standups" },
  { threshold: 0.40, agentId: "back-office", kind: "complete", text: "Processed 7 invoices to Tripletex" },
  { threshold: 0.46, agentId: "support", kind: "complete", text: "Replied to 5 tickets" },
  { threshold: 0.52, agentId: "copy", kind: "complete", text: "Tightened landing page hero copy" },
  { threshold: 0.56, agentId: "support", kind: "resolve", text: "Escalation routed to Anna, resolved" },
  { threshold: 0.58, agentId: "sales", kind: "complete", text: "Followed up: 12 cold prospects" },
  { threshold: 0.62, agentId: "analyst", kind: "complete", text: "Refreshed CRM dashboard" },
  { threshold: 0.65, agentId: "back-office", kind: "complete", text: "Audited subscription renewals" },
  { threshold: 0.70, agentId: "support", kind: "complete", text: "Updated FAQ: refund window" },
  { threshold: 0.76, agentId: "copy", kind: "complete", text: "Repurposed webinar into 8-tweet thread" },
  { threshold: 0.82, agentId: "sales", kind: "complete", text: "Booked demo with Anna Karenina" },
  { threshold: 0.86, agentId: "analyst", kind: "complete", text: "Compiled board summary deck" },
  { threshold: 0.88, agentId: "back-office", kind: "complete", text: "Exported Q1 P&L to drive" },
  { threshold: 0.92, agentId: "support", kind: "complete", text: "Refund processed: order #4488" }
];

const ISSUE_OPEN = 0.24;
const ISSUE_RESOLVE = 0.56;
const ISSUE_AGENT: AgentId = "support";
const ISSUE_TEXT = "Customer escalation, awaiting review";

const ACTIVE_BASE = 11;
const ACTIVE_PEAK_DELTA = 4;
const DONE_FROM = 6;
const DONE_TO = 23;

const RUNNING_BAND = 0.04;
const FEED_VISIBLE = 6;

type TaskState = "queued" | "running" | "done";

function taskState(threshold: number, progress: number): TaskState {
  if (progress < threshold - RUNNING_BAND) return "queued";
  if (progress < threshold) return "running";
  return "done";
}

function relativeAgo(eventThreshold: number, currentProgress: number): string {
  const seconds = Math.max(1, Math.round((currentProgress - eventThreshold) * 360));
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h`;
}

function activeCount(progress: number): number {
  return Math.round(ACTIVE_BASE + Math.sin(progress * Math.PI) * ACTIVE_PEAK_DELTA);
}

function doneCount(progress: number): number {
  return Math.round(DONE_FROM + (DONE_TO - DONE_FROM) * progress);
}

function agentById(id: AgentId): Agent {
  const agent = agents.find((a) => a.id === id);
  if (!agent) throw new Error(`Unknown agent ${id}`);
  return agent;
}

type AgentSummary = {
  agent: Agent;
  current: { task: Task; state: TaskState };
  queued: number;
  done: number;
};

function agentSummary(agent: Agent, progress: number): AgentSummary {
  const states = agent.tasks.map((task) => ({ task, state: taskState(task.threshold, progress) }));
  const running = states.find((s) => s.state === "running");
  const lastDone = [...states].reverse().find((s) => s.state === "done");
  const current = running ?? lastDone ?? states[0];
  const queued = states.filter((s) => s.state === "queued").length;
  const done = states.filter((s) => s.state === "done").length;
  return { agent, current, queued, done };
}

export function Newsroom() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [progress, setProgress] = useState(0);
  const [staticMode, setStaticMode] = useState(false);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      setStaticMode(true);
      setProgress(1);
      return;
    }

    const section = sectionRef.current;
    if (!section) return;

    let inView = false;
    let rafId = 0;

    const update = () => {
      const rect = section.getBoundingClientRect();
      const vh = window.innerHeight;
      const totalDistance = rect.height + vh;
      const traveled = vh - rect.top;
      const p = Math.max(0, Math.min(1, traveled / totalDistance));
      setProgress(p);
    };

    const onScroll = () => {
      if (!inView) return;
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(update);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting;
        if (inView) update();
      },
      { threshold: 0 }
    );
    observer.observe(section);

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    update();

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(rafId);
    };
  }, []);

  const issueOpen = progress >= ISSUE_OPEN && progress < ISSUE_RESOLVE;
  const active = activeCount(progress);
  const done = doneCount(progress);
  const issues = issueOpen ? 1 : 0;

  const visibleFeed = feedEvents.filter((e) => e.threshold <= progress).slice(-FEED_VISIBLE).reverse();

  return (
    <section
      ref={sectionRef}
      id="agents"
      className="newsroom mx-auto max-w-7xl px-5 py-24 sm:px-8"
      data-mode={staticMode ? "static" : "scroll"}
    >
      <div className="max-w-3xl">
        <p className="eyebrow">Live right now</p>
        <h2 className="section-title mt-4">A business that keeps moving.</h2>
        <p className="mt-6 max-w-xl text-lg leading-7 text-[var(--color-muted)]">
          A real Crunchtime agent team in motion. Scroll, and watch the queue clear.
        </p>
      </div>

      <div className="newsroom-strip mt-12">
        <span className="newsroom-pulse" aria-hidden="true" />
        <span className="newsroom-strip-label">live</span>
        <span className="newsroom-stat">
          <span className="newsroom-stat-num">{active}</span>
          <span className="newsroom-stat-label">active</span>
        </span>
        <span className="newsroom-stat">
          <span className="newsroom-stat-num">{done}</span>
          <span className="newsroom-stat-label">done today</span>
        </span>
        <span className="newsroom-stat" data-tone={issues > 0 ? "warn" : "neutral"}>
          <span className="newsroom-stat-num">{issues}</span>
          <span className="newsroom-stat-label">{issues === 1 ? "issue flagged" : "issues flagged"}</span>
        </span>
      </div>

      <div className="newsroom-grid mt-4">
        <div className="newsroom-card">
          <header className="newsroom-card-header">
            <span className="newsroom-card-title">Agents</span>
            <span className="newsroom-card-meta font-mono">{agents.length} online</span>
          </header>
          <ul>
            {agents.map((a) => {
              const summary = agentSummary(a, progress);
              const showIssue = issueOpen && a.id === ISSUE_AGENT;
              const taskTitle = showIssue ? ISSUE_TEXT : summary.current.task.title;
              const taskId = showIssue ? "T-309" : summary.current.task.id;
              const stateAttr = showIssue ? "issue" : summary.current.state;
              return (
                <li key={a.id} className="newsroom-agent" data-issue={showIssue}>
                  <span className={`newsroom-agent-dot ${a.tone}`} aria-hidden="true" />
                  <div className="newsroom-agent-info">
                    <h3 className="newsroom-agent-name">{a.name}</h3>
                    <p className="newsroom-agent-role">{a.role}</p>
                  </div>
                  <div className="newsroom-agent-task" data-state={stateAttr}>
                    <span className="newsroom-agent-task-id font-mono">{taskId}</span>
                    <span className="newsroom-agent-task-title">{taskTitle}</span>
                  </div>
                  <div className="newsroom-agent-meta">
                    <span>{summary.queued} queued</span>
                    <span>{summary.done} done</span>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="newsroom-card">
          <header className="newsroom-card-header">
            <span className="newsroom-card-title">Activity</span>
            <span className="newsroom-card-meta font-mono">last {Math.min(visibleFeed.length, FEED_VISIBLE)}</span>
          </header>
          <ol>
            {visibleFeed.length === 0 ? (
              <li className="newsroom-feed-empty">Scroll to start the team.</li>
            ) : (
              visibleFeed.map((event) => {
                const ago = relativeAgo(event.threshold, progress);
                const agentName = agentById(event.agentId).name;
                return (
                  <li
                    key={`${event.threshold}-${event.kind}`}
                    className="newsroom-feed-item"
                    data-kind={event.kind}
                  >
                    <span className="newsroom-feed-time font-mono">{ago}</span>
                    <span className="newsroom-feed-dot" aria-hidden="true" />
                    <span className="newsroom-feed-agent">{agentName}</span>
                    <span className="newsroom-feed-text">{event.text}</span>
                  </li>
                );
              })
            )}
          </ol>
        </div>
      </div>
    </section>
  );
}
