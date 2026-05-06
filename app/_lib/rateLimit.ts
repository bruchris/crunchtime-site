/**
 * In-memory sliding-window rate limiter.
 *
 * Limitations (documented for v1):
 *  - Resets on server restart (Vercel cold start, redeploy).
 *  - Not shared across Vercel serverless instances; each instance counts independently,
 *    so the effective limit can be up to N × instances.
 *  - v2 upgrade: replace with Upstash Redis (`@upstash/ratelimit`) keyed by IP.
 *    The module's `check(ip)` shape is intentionally identical to Upstash's
 *    `limit()` return shape so swapping is a one-file change.
 */

export type RateLimitResult =
  | { ok: true; remaining: number }
  | { ok: false; retryAfterSec: number };

export interface RateLimiterOptions {
  max: number;
  windowMs: number;
}

export interface RateLimiter {
  check: (key: string) => RateLimitResult;
}

export function createRateLimiter(opts: RateLimiterOptions): RateLimiter {
  const hits = new Map<string, number[]>();

  return {
    check(key: string): RateLimitResult {
      const now = Date.now();
      const cutoff = now - opts.windowMs;
      const arr = (hits.get(key) ?? []).filter((t) => t > cutoff);

      if (arr.length >= opts.max) {
        const oldest = arr[0];
        const retryAfterSec = Math.max(1, Math.ceil((oldest + opts.windowMs - now) / 1000));
        hits.set(key, arr);
        return { ok: false, retryAfterSec };
      }

      arr.push(now);
      hits.set(key, arr);
      return { ok: true, remaining: opts.max - arr.length };
    }
  };
}

// Singleton instance used by /api/brief.
export const briefRateLimiter = createRateLimiter({
  max: 5,
  windowMs: 60 * 60 * 1000
});
