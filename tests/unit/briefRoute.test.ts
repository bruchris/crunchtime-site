import { describe, it, expect, beforeEach, vi } from "vitest";

const generateTextMock = vi.fn();
vi.mock("ai", () => ({
  generateText: (...args: unknown[]) => generateTextMock(...args),
  Output: {
    object: (config: unknown) => config
  }
}));
vi.mock("@ai-sdk/anthropic", () => ({
  createAnthropic: () => () => ({})
}));

import { POST } from "../../app/api/brief/route";

function makeReq(body: unknown, ip = "9.9.9.9") {
  return new Request("http://localhost/api/brief", {
    method: "POST",
    headers: { "content-type": "application/json", "x-forwarded-for": ip },
    body: JSON.stringify(body)
  });
}

beforeEach(() => {
  generateTextMock.mockReset();
  vi.useRealTimers();
  // Satisfy the ANTHROPIC_API_KEY guard (actual calls are mocked via @ai-sdk/anthropic).
  process.env.ANTHROPIC_API_KEY = "test-key";
});

describe("/api/brief", () => {
  it("returns the schema-valid AI SDK payload on happy path", async () => {
    generateTextMock.mockResolvedValueOnce({
      output: {
        agents: [{ name: "AR", color: "lime", tools: ["stripe"] }],
        logs: [
          { agent: "AR", action: "did x", ts: "10:00" },
          { agent: "AR", action: "did y", ts: "10:01" },
          { agent: "AR", action: "did z", ts: "10:02" }
        ],
        recommendation: { headline: "ok", ask: "ok?" }
      }
    });
    const res = await POST(makeReq({ brief: "fakturaene er sene", lang: "no" }, "ip-1"));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.agents[0].name).toBe("AR");
  });

  it("returns canned fallback when generateObject throws (validation/network/timeout)", async () => {
    generateTextMock.mockRejectedValueOnce(new Error("schema validation failed"));
    const res = await POST(makeReq({ brief: "fakturaene er sene", lang: "no" }, "ip-2"));
    expect(res.status).toBe(200);
    const body = await res.json();
    // ar_cashflow keyword route → AR-spesialist
    expect(body.agents[0].name).toBe("AR-spesialist");
  });

  it("returns canned fallback when generateObject rejects on connection error", async () => {
    generateTextMock.mockRejectedValueOnce(new Error("connection error"));
    const res = await POST(makeReq({ brief: "kundeservice koker", lang: "no" }, "ip-3"));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.agents.some((a: { name: string }) => /Tier-1|Tier 1/.test(a.name))).toBe(true);
  });

  it("returns 400 on missing brief", async () => {
    const res = await POST(makeReq({ lang: "no" }, "ip-4"));
    expect(res.status).toBe(400);
  });

  it("returns 400 on invalid lang", async () => {
    const res = await POST(makeReq({ brief: "ok", lang: "fr" }, "ip-5"));
    expect(res.status).toBe(400);
  });

  it("returns 429 after 5 successful submissions from the same IP", async () => {
    generateTextMock.mockResolvedValue({
      output: {
        agents: [{ name: "AR", color: "lime", tools: ["stripe"] }],
        logs: [
          { agent: "AR", action: "x", ts: "10:00" },
          { agent: "AR", action: "y", ts: "10:01" },
          { agent: "AR", action: "z", ts: "10:02" }
        ],
        recommendation: { headline: "ok", ask: "ok?" }
      }
    });
    const ip = "ip-rl-" + Date.now();
    for (let i = 0; i < 5; i++) {
      const r = await POST(makeReq({ brief: "ok", lang: "no" }, ip));
      expect(r.status).toBe(200);
    }
    const sixth = await POST(makeReq({ brief: "ok", lang: "no" }, ip));
    expect(sixth.status).toBe(429);
    expect(sixth.headers.get("retry-after")).toBeTruthy();
  });
});
