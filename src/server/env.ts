import 'server-only';
import { z } from 'zod';

/** Validated server environment. Import `env` instead of reading process.env directly. */
const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  APP_URL: z.string().url().default('http://localhost:3000'),
  DATABASE_URL: z.string().min(1),
  APP_ENCRYPTION_KEY: z
    .string()
    .refine((v) => Buffer.from(v, 'base64').length === 32, 'APP_ENCRYPTION_KEY must be 32 bytes, base64'),
  AUTH_SECRET: z.string().min(32, 'AUTH_SECRET must be at least 32 characters'),
  REDIS_URL: z.string().optional().default(''),
  /** redis | postgres | memory — defaults to redis when REDIS_URL is set, otherwise postgres. */
  RATE_LIMIT_STORE: z.enum(['redis', 'postgres', 'memory']).optional(),
  SMTP_HOST: z.string().optional().default(''),
  SMTP_PORT: z.coerce.number().default(1025),
  SMTP_USER: z.string().optional().default(''),
  SMTP_PASSWORD: z.string().optional().default(''),
  SMTP_FROM: z.string().default('ZatcaWeb <no-reply@zatcaweb.local>'),
  MESSAGING_PROVIDER: z.enum(['mock']).default('mock'),
});

function load() {
  const parsed = schema.safeParse(process.env);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => `  - ${i.path.join('.')}: ${i.message}`).join('\n');
    throw new Error(`Invalid environment configuration:\n${issues}\nSee .env.example.`);
  }
  return parsed.data;
}

let cached: z.infer<typeof schema> | undefined;
export const env = new Proxy({} as z.infer<typeof schema>, {
  get(_t, key: string) {
    cached ??= load();
    return cached[key as keyof typeof cached];
  },
});

export const isProd = () => env.NODE_ENV === 'production';
