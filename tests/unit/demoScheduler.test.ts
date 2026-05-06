import { describe, it, expect, beforeEach, vi } from "vitest";
import { createDemoScheduler, type DemoEvent } from "../../app/_lib/demoScheduler";
import type { BriefResponse } from "../../app/_lib/briefSchema";

const payload: BriefResponse = {
  agents: [
    { name: "A", color: "lime", tools: ["t1", "t2"] },
    { name: "B", color: "blue", tools: ["t3"] }
  ],
  logs: [
    { agent: "A", action: "did x", ts: "10:00" },
    { agent: "B", action: "did y", ts: "10:01" },
    { agent: "A", action: "did z", ts: "10:02" }
  ],
  recommendation: { headline: "h", ask: "a" }
};

describe("demoScheduler", () => {
  beforeEach(() => vi.useFakeTimers());

  it("emits phase events in order: brief-in → team-forms → tools-connect → logs-stream → end-card", () => {
    const events: DemoEvent[] = [];
    const sched = createDemoScheduler(payload, { reducedMotion: false, onEvent: (e) => events.push(e) });
    sched.start();
    vi.advanceTimersByTime(20_000);
    const phases = events.filter((e) => e.type === "phase").map((e) => (e as { type: "phase"; phase: string }).phase);
    expect(phases).toEqual(["brief-in", "team-forms", "tools-connect", "logs-stream", "end-card"]);
  });

  it("emits one agent-spawn per agent during team-forms", () => {
    const events: DemoEvent[] = [];
    const sched = createDemoScheduler(payload, { reducedMotion: false, onEvent: (e) => events.push(e) });
    sched.start();
    vi.advanceTimersByTime(20_000);
    expect(events.filter((e) => e.type === "agent-spawn")).toHaveLength(2);
  });

  it("emits one log-line per log during logs-stream", () => {
    const events: DemoEvent[] = [];
    const sched = createDemoScheduler(payload, { reducedMotion: false, onEvent: (e) => events.push(e) });
    sched.start();
    vi.advanceTimersByTime(20_000);
    expect(events.filter((e) => e.type === "log-line")).toHaveLength(3);
  });

  it("skip() jumps straight to end-card with all data emitted at once", () => {
    const events: DemoEvent[] = [];
    const sched = createDemoScheduler(payload, { reducedMotion: false, onEvent: (e) => events.push(e) });
    sched.start();
    vi.advanceTimersByTime(500); // partway through
    sched.skip();
    const phases = events.filter((e) => e.type === "phase").map((e) => (e as { type: "phase"; phase: string }).phase);
    expect(phases[phases.length - 1]).toBe("end-card");
    expect(events.filter((e) => e.type === "agent-spawn")).toHaveLength(2);
    expect(events.filter((e) => e.type === "log-line")).toHaveLength(3);
  });

  it("reducedMotion=true compresses phases to ~2s each", () => {
    const events: DemoEvent[] = [];
    const sched = createDemoScheduler(payload, { reducedMotion: true, onEvent: (e) => events.push(e) });
    sched.start();
    vi.advanceTimersByTime(2500);
    const phases = events.filter((e) => e.type === "phase").map((e) => (e as { type: "phase"; phase: string }).phase);
    expect(phases).toContain("end-card");
  });
});
