import { describe, it, expect } from "vitest";
import { leadInputSchema } from "../../app/_lib/leadSchema";

const baseValid = {
  name: "Ada Lovelace",
  email: "ada@example.com",
  company: "Analytical Engines AS",
  website: "https://example.com",
  notes: "",
  brief: "fakturaene våre er sene",
  demoPayload: {
    agents: [{ name: "AR", color: "lime", tools: ["stripe"] }],
    logs: [
      { agent: "AR", action: "did a thing", ts: "11:42" },
      { agent: "AR", action: "did another thing", ts: "11:43" },
      { agent: "AR", action: "did a third thing", ts: "11:44" }
    ],
    recommendation: { headline: "ok", ask: "ja?" }
  },
  language: "no" as const,
  source: "brief-box-v1" as const,
  company_phone: ""
};

describe("leadInputSchema", () => {
  it("accepts a fully valid payload", () => {
    expect(leadInputSchema.safeParse(baseValid).success).toBe(true);
  });
  it("lowercases the email", () => {
    expect(leadInputSchema.parse({ ...baseValid, email: "ADA@EXAMPLE.COM" }).email).toBe("ada@example.com");
  });
  it("rejects malformed email", () => {
    expect(leadInputSchema.safeParse({ ...baseValid, email: "not-an-email" }).success).toBe(false);
  });
  it("rejects website without protocol", () => {
    expect(leadInputSchema.safeParse({ ...baseValid, website: "example.com" }).success).toBe(false);
  });
  it("rejects empty company", () => {
    expect(leadInputSchema.safeParse({ ...baseValid, company: "   " }).success).toBe(false);
  });
  it("rejects brief over 500 chars", () => {
    expect(leadInputSchema.safeParse({ ...baseValid, brief: "x".repeat(501) }).success).toBe(false);
  });
  it("rejects unknown language", () => {
    expect(leadInputSchema.safeParse({ ...baseValid, language: "de" }).success).toBe(false);
  });
  it("requires source to be the literal", () => {
    expect(leadInputSchema.safeParse({ ...baseValid, source: "other" }).success).toBe(false);
  });
  it("accepts a filled honeypot at parse time (route handles rejection)", () => {
    expect(leadInputSchema.safeParse({ ...baseValid, company_phone: "+47 99 88 77 66" }).success).toBe(true);
  });
  it("trims whitespace on visible fields", () => {
    const r = leadInputSchema.parse({ ...baseValid, name: "  Ada  ", company: "  AE  " });
    expect(r.name).toBe("Ada");
    expect(r.company).toBe("AE");
  });
});
