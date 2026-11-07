export class TimeoutError extends Error {
  constructor(ms: number) {
    super(`Timed out after ${ms} ms`);
    this.name = "TimeoutError";
  }
}

/** Rejects with TimeoutError if the promise doesn't settle in time. */
export function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new TimeoutError(ms)), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}
