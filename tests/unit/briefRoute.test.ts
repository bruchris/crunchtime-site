import { describe, it, expect, beforeEach, vi } from "vitest";

const createMock = vi.fn();
vi.mock("@anthropic-ai/sdk", () => {
  return {
    default: class {
      messages = { create: createMock };
    }
  };
});

import { POST } from "../../app/api/brief/route";

function makeReq(body: unknown, ip = "9.9.9.9") {
  return new Request("http://localhost/api/brief", {
    method: "POST",
    headers: { "content-type": "application/json", "x-forwarded-for": ip },
    body: JSON.stringify(body)
  });
}

beforeEach(() => {
  createMock.mockReset();
  vi.useRealTimers();
  // reset the rate limiter by importing a fresh module isn't trivial; we use a fresh IP per test instead.
});

describe("/api/brief", () => {
  it("returns the schema-valid Haiku payload on happy path", async () => {
    createMock.mockResolvedValueOnce({
      content: [
        {
          type: "text",
          text: JSON.stringify({
            agents: [{ name: "AR", color: "lime", tools: ["stripe"] }],
            logs: [
              { agent: "AR", action: "did x", ts: "10:00" },
              { agent: "AR", action: "did y", ts: "10:01" },
              { agent: "AR", action: "did z", ts: "10:02" }
            ],
            recommendation: { headline: "ok", ask: "ok?" }
          })
        }
      ]
    });
    const res = await POST(makeReq({ brief: "fakturaene er sene", lang: "no" }, "ip-1"));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.agents[0].name).toBe("AR");
  });

  it("returns canned fallback when Haiku returns invalid JSON", async () => {
    createMock.mockResolvedValueOnce({
      content: [{ type: "text", text: "this is not json" }]
    });
    const res = await POST(makeReq({ brief: "fakturaene er sene", lang: "no" }, "ip-2"));
    expect(res.status).toBe(200);
    const body = await res.json();
    // ar_cashflow keyword route -> AR-spesialist
    expect(body.agents[0].name).toBe("AR-spesialist");
  });

  it("returns canned fallback when Haiku throws (timeout/network)", async () => {
    createMock.mockRejectedValueOnce(new Error("connection error"));
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
    createMock.mockResolvedValue({
      content: [
        {
          type: "text",
          text: JSON.stringify({
            agents: [{ name: "AR", color: "lime", tools: ["stripe"] }],
            logs: [
              { agent: "AR", action: "x", ts: "10:00" },
              { agent: "AR", action: "y", ts: "10:01" },
              { agent: "AR", action: "z", ts: "10:02" }
            ],
            recommendation: { headline: "ok", ask: "ok?" }
          })
        }
      ]
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
