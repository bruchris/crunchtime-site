import { describe, it, expect } from "vitest";
import { briefResponseSchema } from "../../app/_lib/briefSchema";

const valid = {
  agents: [
    { name: "AR-spesialist", color: "lime", tools: ["stripe", "tripletex"] },
    { name: "Cashflow", color: "amber", tools: ["fiken"] }
  ],
  logs: [
    { agent: "AR-spesialist", action: "drafted 7 chase emails", ts: "11:42" },
    { agent: "Cashflow", action: "flagged 3 at >30d risk", ts: "11:43" },
    { agent: "AR-spesialist", action: "scheduled follow-ups", ts: "11:44" }
  ],
  recommendation: { headline: "3 agenter, ~4t/uke spart.", ask: "Vil du sette dette opp?" }
};

describe("briefResponseSchema", () => {
  it("accepts a valid payload", () => {
    expect(briefResponseSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects 0 agents", () => {
    expect(briefResponseSchema.safeParse({ ...valid, agents: [] }).success).toBe(false);
  });

  it("rejects 5 agents", () => {
    const tooMany = { ...valid, agents: Array(5).fill(valid.agents[0]) };
    expect(briefResponseSchema.safeParse(tooMany).success).toBe(false);
  });

  it("rejects 2 logs", () => {
    expect(briefResponseSchema.safeParse({ ...valid, logs: valid.logs.slice(0, 2) }).success).toBe(false);
  });

  it("rejects headline >80 chars", () => {
    const tooLong = {
      ...valid,
      recommendation: { headline: "x".repeat(81), ask: "ok" }
    };
    expect(briefResponseSchema.safeParse(tooLong).success).toBe(false);
  });

  it("rejects unknown color", () => {
    const bad = {
      ...valid,
      agents: [{ name: "X", color: "purple", tools: ["a"] }, valid.agents[1]]
    };
    expect(briefResponseSchema.safeParse(bad).success).toBe(false);
  });

  it("rejects an agent with 0 tools", () => {
    const bad = {
      ...valid,
      agents: [{ name: "X", color: "lime", tools: [] }, valid.agents[1]]
    };
    expect(briefResponseSchema.safeParse(bad).success).toBe(false);
  });
});
