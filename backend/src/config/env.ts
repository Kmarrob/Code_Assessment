import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.string().transform(Number).default('3000'),
  MONGODB_URI: z.string().min(1, 'MONGODB_URI é obrigatória'),
  MONGODB_DB_NAME: z.string().default('code_assessment'),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET deve ter pelo menos 32 caracteres'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET deve ter pelo menos 32 caracteres'),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  CORS_ORIGIN: z.string().default('http://localhost:5173,https://cisatool.com.br,https://code-assessment-frontend.onrender.com,https://code-assessment-898z.onrender.com'),
  RATE_LIMIT_WINDOW_MS: z.string().transform(Number).default('900000'),
  RATE_LIMIT_MAX: z.string().transform(Number).default('100'),
});

const result = envSchema.safeParse(process.env);

if (!result.success) {
  console.error('❌ Variáveis de ambiente inválidas:', result.error.format());
  process.exit(1);
}

export const config = result.data;
export type EnvConfig = z.infer<typeof envSchema>;