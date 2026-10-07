import { prisma } from '@/server/db';
import type { RateLimitKey, RateLimitResult, RateLimitStore } from './types';

/**
 * PostgreSQL-backed fixed-window rate limiter (used when Redis is unavailable).
 * Buckets expire automatically via a periodic cleanup of resetAt < now.
 */
export class PostgresStore implements RateLimitStore {
  async increment(key: RateLimitKey, limit: number, windowMs: number): Promise<RateLimitResult> {
    const now = Date.now();
    const resetAtMs = now + windowMs;
    const resetAt = new Date(resetAtMs);

    const updated = await prisma.rateLimitBucket.updateMany({
      where: { key, resetAt: { gt: new Date(now) } },
      data: { count: { increment: 1 } },
    });

    if (updated.count === 1) {
      const b = await prisma.rateLimitBucket.findUniqueOrThrow({ where: { key } });
      const remaining = Math.max(0, limit - b.count);
      return { allowed: b.count <= limit, remaining, resetMs: b.resetAt.getTime(), limit };
    }

    const b = await prisma.rateLimitBucket.upsert({
      where: { key },
      create: { key, count: 1, resetAt },
      update: { count: 1, resetAt },
    });
    const remaining = Math.max(0, limit - b.count);
    return { allowed: b.count <= limit, remaining, resetMs: b.resetAt.getTime(), limit };
  }

  async cleanup(nowMs: number): Promise<void> {
    await prisma.rateLimitBucket.deleteMany({ where: { resetAt: { lt: new Date(nowMs) } } });
  }
}
