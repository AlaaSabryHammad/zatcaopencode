import Redis from 'ioredis';
import type { RateLimitKey, RateLimitResult, RateLimitStore } from './types';

/** Redis fixed-window rate limiter using INCR + EXPIRE (atomic for first hit). */
export class RedisStore implements RateLimitStore {
  constructor(private redis: Redis) {}

  async increment(key: RateLimitKey, limit: number, windowMs: number): Promise<RateLimitResult> {
    const windowSec = Math.ceil(windowMs / 1000);
    const fullKey = `rl:${key}`;
    const count = await this.redis.incr(fullKey);
    if (count === 1) {
      await this.redis.expire(fullKey, windowSec, 'NX');
    }
    const ttl = await this.redis.ttl(fullKey);
    const resetMs = ttl > 0 ? Date.now() + ttl * 1000 : Date.now() + windowMs;
    const allowed = count <= limit;
    const remaining = Math.max(0, limit - count);
    return { allowed, remaining, resetMs, limit };
  }
}
