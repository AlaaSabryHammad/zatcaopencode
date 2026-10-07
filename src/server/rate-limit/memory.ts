import type { RateLimitKey, RateLimitResult, RateLimitStore } from './types';

interface Bucket {
  count: number;
  resetMs: number;
}

/** In-memory fixed-window store (single process). Development fallback only. */
export class MemoryStore implements RateLimitStore {
  private buckets = new Map<string, Bucket>();

  async increment(key: RateLimitKey, limit: number, windowMs: number): Promise<RateLimitResult> {
    const now = Date.now();
    let b = this.buckets.get(key);
    if (!b || b.resetMs <= now) {
      b = { count: 0, resetMs: now + windowMs };
      this.buckets.set(key, b);
    }
    b.count += 1;
    const allowed = b.count <= limit;
    const remaining = Math.max(0, limit - b.count);
    return { allowed, remaining, resetMs: b.resetMs, limit };
  }

  async cleanup(nowMs: number): Promise<void> {
    for (const [k, v] of this.buckets) {
      if (v.resetMs <= nowMs) this.buckets.delete(k);
    }
  }
}
