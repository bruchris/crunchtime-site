import type { BriefResponse } from "./briefSchema";

export type DemoPhase =
  | "idle"
  | "brief-in"
  | "team-forms"
  | "tools-connect"
  | "logs-stream"
  | "end-card";

export type DemoEvent =
  | { type: "phase"; phase: DemoPhase }
  | { type: "agent-spawn"; index: number }
  | { type: "tool-connect"; agentIndex: number; toolIndex: number }
  | { type: "log-line"; index: number };

export interface SchedulerOptions {
  reducedMotion: boolean;
  onEvent: (e: DemoEvent) => void;
}

interface Timing {
  briefIn: number;
  teamForms: number;     // total for the phase
  agentStagger: number;  // per-agent
  toolsConnect: number;  // total
  toolStagger: number;   // per-tool
  logsStream: number;    // total
  logStagger: number;    // per-log
}

// Tuned 2026-05-07: previously the user saw an empty activity feed for
// ~7.5s after submission (briefIn 500 + teamForms 3000 + toolsConnect 4000
// before the first log line). That read as "stuck". Compressed so the
// first log appears at ~3.5s while keeping the staged team-forms /
// tools-connect choreography readable.
const FULL: Timing = {
  briefIn: 300,
  teamForms: 1400,
  agentStagger: 350,
  toolsConnect: 1800,
  toolStagger: 180,
  logsStream: 5000,
  logStagger: 850
};

// Compressed timings for prefers-reduced-motion: entire sequence completes in ~2s
const REDUCED: Timing = {
  briefIn: 100,
  teamForms: 500,
  agentStagger: 0,
  toolsConnect: 500,
  toolStagger: 0,
  logsStream: 500,
  logStagger: 0
};

export interface DemoScheduler {
  start: () => void;
  skip: () => void;
  cancel: () => void;
}

export function createDemoScheduler(
  payload: BriefResponse,
  opts: SchedulerOptions
): DemoScheduler {
  const t = opts.reducedMotion ? REDUCED : FULL;
  const timeouts: ReturnType<typeof setTimeout>[] = [];
  let cancelled = false;
  let finished = false;

  // Track which items have already been emitted to prevent double-emission on skip()
  const spawnedAgents = new Set<number>();
  const connectedTools = new Set<string>();
  const streamedLogs = new Set<number>();

  const at = (ms: number, fn: () => void) => {
    timeouts.push(setTimeout(() => {
      if (!cancelled && !finished) fn();
    }, ms));
  };

  const emit = (e: DemoEvent) => {
    if (!cancelled && !finished) opts.onEvent(e);
  };

  const emitAgentSpawn = (index: number) => {
    if (!spawnedAgents.has(index)) {
      spawnedAgents.add(index);
      emit({ type: "agent-spawn", index });
    }
  };

  const emitToolConnect = (agentIndex: number, toolIndex: number) => {
    const key = `${agentIndex}:${toolIndex}`;
    if (!connectedTools.has(key)) {
      connectedTools.add(key);
      emit({ type: "tool-connect", agentIndex, toolIndex });
    }
  };

  const emitLogLine = (index: number) => {
    if (!streamedLogs.has(index)) {
      streamedLogs.add(index);
      emit({ type: "log-line", index });
    }
  };

  function start() {
    let cursor = 0;
    emit({ type: "phase", phase: "brief-in" });

    cursor += t.briefIn;
    at(cursor, () => emit({ type: "phase", phase: "team-forms" }));

    payload.agents.forEach((_, i) => {
      at(cursor + i * t.agentStagger, () => emitAgentSpawn(i));
    });

    cursor += t.teamForms;
    at(cursor, () => emit({ type: "phase", phase: "tools-connect" }));

    let toolOffset = 0;
    payload.agents.forEach((agent, ai) => {
      agent.tools.forEach((_, ti) => {
        at(cursor + toolOffset, () => emitToolConnect(ai, ti));
        toolOffset += t.toolStagger;
      });
    });

    cursor += t.toolsConnect;
    at(cursor, () => emit({ type: "phase", phase: "logs-stream" }));

    payload.logs.forEach((_, i) => {
      at(cursor + i * t.logStagger, () => emitLogLine(i));
    });

    cursor += t.logsStream;
    at(cursor, () => emit({ type: "phase", phase: "end-card" }));
  }

  function skip() {
    if (finished || cancelled) return;
    timeouts.forEach(clearTimeout);
    timeouts.length = 0;
    // Emit everything not yet emitted so React renders the final state.
    payload.agents.forEach((a, ai) => {
      emitAgentSpawn(ai);
      a.tools.forEach((_, ti) => emitToolConnect(ai, ti));
    });
    payload.logs.forEach((_, i) => emitLogLine(i));
    opts.onEvent({ type: "phase", phase: "end-card" });
    finished = true;
  }

  function cancel() {
    cancelled = true;
    timeouts.forEach(clearTimeout);
    timeouts.length = 0;
  }

  return { start, skip, cancel };
}
