export interface RetryOptions {
  attempts: number;
  delaysMs: number[]; // length must be >= attempts - 1
  sleep?: (ms: number) => Promise<void>;
}

const defaultSleep = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions
): Promise<T> {
  const sleep = options.sleep ?? defaultSleep;
  let lastError: unknown;
  for (let attempt = 0; attempt < options.attempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (attempt === options.attempts - 1) break;
      await sleep(options.delaysMs[attempt] ?? 0);
    }
  }
  throw lastError;
}
