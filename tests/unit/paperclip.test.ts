import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const insertedLead = { pageId: "page-123", url: "https://notion.so/page-123" };
const baseLead = {
  name: "Ada", email: "ada@example.com", company: "AE", website: "https://example.com",
  notes: "", brief: "fakturaene er sene",
  demoPayload: {
    agents: [{ name: "AR", color: "lime", tools: ["stripe"] }],
    logs: [{ agent: "AR", action: "did", ts: "11:42" }],
    recommendation: { headline: "3 agenter", ask: "ok?" }
  },
  language: "no" as const, source: "brief-box-v1" as const, company_phone: ""
};

const PAPERCLIP_ENV = {
  PAPERCLIP_API_BASE: "https://paperclip.example.com",
  PAPERCLIP_API_TOKEN: "pcp_test_token",
  PAPERCLIP_COMPANY_ID: "company-1",
  PAPERCLIP_PROJECT_ID: "project-1",
  PAPERCLIP_GOAL_ID: "goal-1",
  PAPERCLIP_AGENT_ID: "agent-1"
};

function okIssueResponse(identifier = "BRU-99") {
  return new Response(JSON.stringify({ id: "issue-uuid", identifier }), { status: 201 });
}

describe("triggerPaperclipResearchAgent", () => {
  const originalEnv = process.env;
  let markStatus: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    process.env = { ...originalEnv, ...PAPERCLIP_ENV };
    vi.resetModules();
    markStatus = vi.fn().mockResolvedValue(undefined);
    vi.doMock("../../app/_lib/notion", () => ({ markLeadStatus: markStatus }));
  });
  afterEach(() => { process.env = originalEnv; vi.restoreAllMocks(); });

  async function run(fetchMock: ReturnType<typeof vi.fn>) {
    vi.stubGlobal("fetch", fetchMock);
    const { triggerPaperclipResearchAgent } = await import("../../app/_lib/paperclip");
    await triggerPaperclipResearchAgent(insertedLead, baseLead, { sleep: async () => {} });
  }

  it("creates an issue on first attempt and flips Notion to plan-pending with linked URL", async () => {
    const fetchMock = vi.fn().mockResolvedValue(okIssueResponse("BRU-42"));
    await run(fetchMock);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://paperclip.example.com/api/companies/company-1/issues");
    expect((init as RequestInit).method).toBe("POST");
    const headers = (init as RequestInit).headers as Record<string, string>;
    expect(headers.Authorization).toBe("Bearer pcp_test_token");
    const body = JSON.parse((init as RequestInit).body as string);
    expect(body.assigneeAgentId).toBe("agent-1");
    expect(body.projectId).toBe("project-1");
    expect(body.goalId).toBe("goal-1");
    expect(body.priority).toBe("high");
    expect(body.title).toContain("AE");
    expect(body.description).toContain("ada@example.com");
    expect(markStatus).toHaveBeenCalledWith("page-123", "plan-pending",
      expect.objectContaining({
        paperclipUrl: expect.stringContaining("BRU-42"),
        note: expect.stringContaining("BRU-42")
      }));
  });

  it("retries on 5xx and succeeds on the second attempt", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response("nope", { status: 503 }))
      .mockResolvedValueOnce(okIssueResponse());
    await run(fetchMock);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(markStatus).toHaveBeenCalledWith("page-123", "plan-pending", expect.anything());
  });

  it("marks Notion manual-review after 3 terminal failures", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response("server down", { status: 500 }));
    await run(fetchMock);
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(markStatus).toHaveBeenCalledWith("page-123", "manual-review",
      expect.objectContaining({ note: expect.stringContaining("paperclip api failed") }));
  });

  it("does NOT retry on 4xx and marks manual-review immediately", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response("bad payload", { status: 400 }));
    await run(fetchMock);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(markStatus).toHaveBeenCalledWith("page-123", "manual-review",
      expect.objectContaining({ note: expect.stringContaining("4xx") }));
  });

  it("is a no-op when PAPERCLIP_API_* env vars are not all set", async () => {
    delete process.env.PAPERCLIP_API_TOKEN;
    const fetchMock = vi.fn();
    await run(fetchMock);
    expect(fetchMock).not.toHaveBeenCalled();
    expect(markStatus).not.toHaveBeenCalled();
  });

  it("flags manual-review when the response is 2xx but missing id/identifier", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response("{}", { status: 201 }));
    await run(fetchMock);
    expect(markStatus).toHaveBeenCalledWith("page-123", "manual-review", expect.anything());
  });
});
