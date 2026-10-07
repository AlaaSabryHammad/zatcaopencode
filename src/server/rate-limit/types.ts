export type RateLimitKey = string;

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  /** Unix milliseconds when the window resets. */
  resetMs: number;
  /** Number of requests allowed in the window. */
  limit: number;
}

export interface RateLimitStore {
  /**
   * Increment the counter for `key` in a fixed window of `windowMs`.
   * @returns the state after increment.
   */
  increment(key: RateLimitKey, limit: number, windowMs: number): Promise<RateLimitResult>;
  /** Optional cleanup of expired buckets. */
  cleanup?(nowMs: number): Promise<void>;
}
