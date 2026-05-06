import { describe, it, expect } from "vitest";
import { briefExcerpt } from "../../app/[locale]/services/_lib/briefExcerpt";

describe("briefExcerpt", () => {
  it("returns null for empty input", () => {
    expect(briefExcerpt(undefined)).toBeNull();
    expect(briefExcerpt("")).toBeNull();
    expect(briefExcerpt("   ")).toBeNull();
  });

  it("returns the trimmed brief if shorter than max", () => {
    expect(briefExcerpt("  fakturaene er sene  ")).toBe("fakturaene er sene");
  });

  it("truncates long briefs to 80 chars and adds an ellipsis", () => {
    const long = "a".repeat(200);
    const out = briefExcerpt(long)!;
    expect(out.length).toBeLessThanOrEqual(81);
    expect(out.endsWith("…")).toBe(true);
  });

  it("strips control characters but keeps Norwegian letters", () => {
    expect(briefExcerpt("e-post tar over livet ")).toBe("e-post tar over livet");
    expect(briefExcerpt("å ø æ")).toBe("å ø æ");
  });
});
