import { describe, it, expect } from "vitest";
import { isHoneypotTriggered } from "../../app/_lib/honeypot";

describe("isHoneypotTriggered", () => {
  it("returns false for empty string", () => expect(isHoneypotTriggered("")).toBe(false));
  it("returns false for undefined", () => expect(isHoneypotTriggered(undefined)).toBe(false));
  it("returns false for whitespace-only", () => expect(isHoneypotTriggered("   \t\n  ")).toBe(false));
  it("returns true for any non-whitespace content", () => expect(isHoneypotTriggered("anything")).toBe(true));
  it("returns true for a phone-like string", () => expect(isHoneypotTriggered("+47 99 88 77 66")).toBe(true));
});
