import { describe, it, expect, beforeEach, vi } from "vitest";
import { createRateLimiter } from "../../app/_lib/rateLimit";

describe("createRateLimiter (5 req / 1h sliding window)", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-03T10:00:00Z"));
  });

  it("allows 5 requests then blocks the 6th", () => {
    const limiter = createRateLimiter({ max: 5, windowMs: 60 * 60 * 1000 });
    const ip = "1.2.3.4";
    for (let i = 0; i < 5; i++) {
      expect(limiter.check(ip).ok).toBe(true);
    }
    expect(limiter.check(ip).ok).toBe(false);
  });

  it("recovers fully after the window passes", () => {
    const limiter = createRateLimiter({ max: 5, windowMs: 60 * 60 * 1000 });
    const ip = "1.2.3.4";
    for (let i = 0; i < 5; i++) limiter.check(ip);
    expect(limiter.check(ip).ok).toBe(false);
    vi.advanceTimersByTime(60 * 60 * 1000 + 1);
    expect(limiter.check(ip).ok).toBe(true);
  });

  it("tracks IPs independently", () => {
    const limiter = createRateLimiter({ max: 5, windowMs: 60 * 60 * 1000 });
    for (let i = 0; i < 5; i++) limiter.check("a");
    expect(limiter.check("a").ok).toBe(false);
    expect(limiter.check("b").ok).toBe(true);
  });

  it("returns retryAfterSec on block", () => {
    const limiter = createRateLimiter({ max: 1, windowMs: 60 * 60 * 1000 });
    limiter.check("x");
    const r = limiter.check("x");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.retryAfterSec).toBeGreaterThan(3500);
  });
});
