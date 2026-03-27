import { registerAs } from '@nestjs/config';
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(3001),
  FRONTEND_URL: z.string().url().default('http://localhost:3000'),
  SUPABASE_URL: z.string().url(),
  SUPABASE_SECRET_KEY: z.string().min(1).optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
  SUPABASE_JWT_SECRET: z.string().min(1),
  DATABASE_URL: z.string().url(),
}).superRefine((data, ctx) => {
  if (!data.SUPABASE_SECRET_KEY && !data.SUPABASE_SERVICE_ROLE_KEY) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message:
        'Provide SUPABASE_SECRET_KEY (preferred) or SUPABASE_SERVICE_ROLE_KEY (legacy)',
    });
  }
});

type ParsedAppConfig = z.infer<typeof envSchema>;
type AppConfig = Omit<ParsedAppConfig, 'SUPABASE_SERVICE_ROLE_KEY'> & {
  SUPABASE_SECRET_KEY: string;
};

let _config: AppConfig | null = null;

function parseEnv(): AppConfig {
  if (_config) return _config;
  const parsed = envSchema.parse(process.env);
  _config = {
    ...parsed,
    SUPABASE_SECRET_KEY: parsed.SUPABASE_SECRET_KEY ?? parsed.SUPABASE_SERVICE_ROLE_KEY!,
  };
  return _config;
}

export const appConfig = registerAs('app', () => parseEnv());
