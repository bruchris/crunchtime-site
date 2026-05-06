import { describe, it, expect } from "vitest";
import { pickTemplate, getTemplate, TEMPLATE_KEYS } from "../../app/_lib/cannedTemplates";
import { briefResponseSchema } from "../../app/_lib/briefSchema";

describe("cannedTemplates", () => {
  it("has at least 12 templates plus general", () => {
    expect(TEMPLATE_KEYS.length).toBeGreaterThanOrEqual(13);
    expect(TEMPLATE_KEYS).toContain("general");
  });

  it("every template parses against the schema in both languages", () => {
    for (const key of TEMPLATE_KEYS) {
      for (const lang of ["no", "en"] as const) {
        const tpl = getTemplate(key, lang);
        const result = briefResponseSchema.safeParse(tpl);
        if (!result.success) {
          throw new Error(`Template ${key}/${lang} invalid: ${JSON.stringify(result.error.issues)}`);
        }
      }
    }
  });

  it("routes 'fakturaene er sene' to ar_cashflow", () => {
    expect(pickTemplate("fakturaene våre er sene", "no")).toBe("ar_cashflow");
  });

  it("routes 'we lose leads' to sales_crm", () => {
    expect(pickTemplate("we keep losing leads to slow follow-up", "en")).toBe("sales_crm");
  });

  it("routes 'e-post tar over livet' to inbox_triage", () => {
    expect(pickTemplate("e-post tar over livet mitt", "no")).toBe("inbox_triage");
  });

  it("routes 'kundeservice koker' to support_tier1", () => {
    expect(pickTemplate("kundeservice koker over", "no")).toBe("support_tier1");
  });

  it("routes 'ingen tid til markedsføring' to content_social", () => {
    expect(pickTemplate("ingen tid til markedsføring", "no")).toBe("content_social");
  });

  it("falls back to 'general' on a brief with no keyword hits", () => {
    expect(pickTemplate("xyzzy plover frobnitz", "no")).toBe("general");
  });

  it("routes 'bookkeeping software' to data_entry", () => {
    expect(pickTemplate("bookkeeping software", "en")).toBe("data_entry");
  });

  it("routes 'research the market for product' to research", () => {
    expect(pickTemplate("research the market for product", "en")).toBe("research");
  });
});
