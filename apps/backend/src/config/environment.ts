import { z } from 'zod';

const environmentSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65_535).default(3001),
  DATABASE_URL: z.string().min(1),
  REDIS_URL: z.string().min(1),
  PUBLIC_BASE_URL: z.url(),
  STRIPE_WEBHOOK_SECRET: z.string().min(16),
  MINIMUM_PURCHASE_AGE: z.coerce.number().int().min(1).max(120),
  ALCOHOL_TERMS_VERSION: z.string().trim().min(1).max(100),
  LOGIN_RATE_LIMIT_MAX_ATTEMPTS: z.coerce.number().int().min(1).max(1_000),
  LOGIN_RATE_LIMIT_WINDOW_SECONDS: z.coerce.number().int().min(1).max(86_400),
});

export type Environment = z.infer<typeof environmentSchema>;

export function validateEnvironment(input: Record<string, unknown>): Environment {
  return environmentSchema.parse(input);
}
