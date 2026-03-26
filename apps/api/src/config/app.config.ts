import { registerAs } from '@nestjs/config';
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(3001),
  FRONTEND_URL: z.string().url().default('http://localhost:3000'),
  SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  SUPABASE_JWT_SECRET: z.string().min(1),
  DATABASE_URL: z.string().url(),
});

type AppConfig = z.infer<typeof envSchema>;

let _config: AppConfig | null = null;

function parseEnv(): AppConfig {
  if (_config) return _config;
  _config = envSchema.parse(process.env);
  return _config;
}

export const appConfig = registerAs('app', () => parseEnv());
