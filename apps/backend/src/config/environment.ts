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
  PASSWORD_RECOVERY_TOKEN_TTL_SECONDS: z.coerce.number().int().min(300).max(86_400),
  PASSWORD_RECOVERY_RATE_LIMIT_MAX_ATTEMPTS: z.coerce.number().int().min(1).max(100),
  PASSWORD_RECOVERY_RATE_LIMIT_WINDOW_SECONDS: z.coerce.number().int().min(60).max(86_400),
  PASSWORD_RECOVERY_URL: z.url(),
  PASSWORD_RECOVERY_FROM_EMAIL: z.email(),
  SMTP_HOST: z.string().trim().min(1),
  SMTP_PORT: z.coerce.number().int().min(1).max(65_535),
  SMTP_SECURE: z.stringbool(),
  SMTP_USER: z.string().min(1),
  SMTP_PASSWORD: z.string().min(1),
});

export type Environment = z.infer<typeof environmentSchema>;

export function validateEnvironment(input: Record<string, unknown>): Environment {
  return environmentSchema.parse(input);
}
