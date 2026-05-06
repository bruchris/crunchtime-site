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

describe("triggerPaperclipResearchAgent", () => {
  const originalEnv = process.env;
  let markStatus: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    process.env = { ...originalEnv, PAPERCLIP_WEBHOOK_URL: "https://paperclip.example.com/hook" };
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
  const okResponse = new Response(JSON.stringify({ accepted: true }), { status: 200 });

  it("succeeds on first attempt and does not flip Notion status", async () => {
    const fetchMock = vi.fn().mockResolvedValue(okResponse);
    await run(fetchMock);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(markStatus).not.toHaveBeenCalled();
  });

  it("retries on 5xx and succeeds on the second attempt", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response("nope", { status: 503 }))
      .mockResolvedValueOnce(okResponse);
    await run(fetchMock);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(markStatus).not.toHaveBeenCalled();
  });

  it("marks Notion as manual-review after 3 terminal failures", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response("server down", { status: 500 }));
    await run(fetchMock);
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(markStatus).toHaveBeenCalledWith("page-123", "manual-review",
      expect.objectContaining({ note: expect.stringContaining("paperclip webhook failed") }));
  });

  it("does NOT retry on 4xx and marks manual-review immediately", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response("bad payload", { status: 400 }));
    await run(fetchMock);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(markStatus).toHaveBeenCalledWith("page-123", "manual-review",
      expect.objectContaining({ note: expect.stringContaining("4xx") }));
  });

  it("is a no-op when PAPERCLIP_WEBHOOK_URL is not set", async () => {
    delete process.env.PAPERCLIP_WEBHOOK_URL;
    const fetchMock = vi.fn();
    await run(fetchMock);
    expect(fetchMock).not.toHaveBeenCalled();
    expect(markStatus).not.toHaveBeenCalled();
  });
});
