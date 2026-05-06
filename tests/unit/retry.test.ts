import { describe, it, expect, vi } from "vitest";
import { retryWithBackoff } from "../../app/_lib/retry";

describe("retryWithBackoff", () => {
  it("returns the result on first success", async () => {
    const fn = vi.fn().mockResolvedValue("ok");
    const sleep = vi.fn().mockResolvedValue(undefined);
    const result = await retryWithBackoff(fn, { attempts: 3, delaysMs: [1000, 4000], sleep });
    expect(result).toBe("ok");
    expect(fn).toHaveBeenCalledTimes(1);
    expect(sleep).not.toHaveBeenCalled();
  });

  it("retries on rejection and returns success", async () => {
    const fn = vi.fn()
      .mockRejectedValueOnce(new Error("boom"))
      .mockRejectedValueOnce(new Error("boom"))
      .mockResolvedValue("ok");
    const sleep = vi.fn().mockResolvedValue(undefined);
    const result = await retryWithBackoff(fn, { attempts: 3, delaysMs: [1000, 4000], sleep });
    expect(result).toBe("ok");
    expect(fn).toHaveBeenCalledTimes(3);
    expect(sleep).toHaveBeenNthCalledWith(1, 1000);
    expect(sleep).toHaveBeenNthCalledWith(2, 4000);
  });

  it("throws the last error after all attempts fail", async () => {
    const err = new Error("terminal");
    const fn = vi.fn().mockRejectedValue(err);
    const sleep = vi.fn().mockResolvedValue(undefined);
    await expect(
      retryWithBackoff(fn, { attempts: 3, delaysMs: [1000, 4000], sleep })
    ).rejects.toBe(err);
    expect(fn).toHaveBeenCalledTimes(3);
    expect(sleep).toHaveBeenCalledTimes(2);
  });

  it("uses real setTimeout when no sleep injected", async () => {
    const fn = vi.fn().mockRejectedValueOnce(new Error("boom")).mockResolvedValue("ok");
    const result = await retryWithBackoff(fn, { attempts: 2, delaysMs: [1] });
    expect(result).toBe("ok");
  });
});
