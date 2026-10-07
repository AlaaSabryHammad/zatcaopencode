import 'server-only';
import Redis from 'ioredis';
import { env } from '@/server/env';
import { MemoryStore } from './memory';
import { PostgresStore } from './postgres';
import { RedisStore } from './redis';
import type { RateLimitStore } from './types';

let singleton: RateLimitStore | undefined;
let redis: Redis | undefined;

export function getRateLimitStore(): RateLimitStore {
  if (singleton) return singleton;
  const store = env.RATE_LIMIT_STORE;
  if (store === 'redis' || (store === undefined && env.REDIS_URL)) {
    try {
      redis = new Redis(env.REDIS_URL, { maxRetriesPerRequest: 1, lazyConnect: true });
      singleton = new RedisStore(redis);
      return singleton;
    } catch {
      // fall through to postgres/memory
    }
  }
  if (store === 'postgres' || !store) {
    singleton = new PostgresStore();
    return singleton;
  }
  singleton = new MemoryStore();
  return singleton;
}

export async function closeRateLimitStore() {
  if (redis) {
    await redis.quit().catch(() => {});
    redis = undefined;
    singleton = undefined;
  }
}
