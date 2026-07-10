"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const zod_1 = require("zod");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const envSchema = zod_1.z.object({
    NODE_ENV: zod_1.z.enum(['development', 'test', 'production']).default('development'),
    PORT: zod_1.z.string().transform(Number).default('3000'),
    MONGODB_URI: zod_1.z.string().min(1, 'MONGODB_URI é obrigatória'),
    MONGODB_DB_NAME: zod_1.z.string().default('code_assessment'),
    JWT_SECRET: zod_1.z.string().min(32, 'JWT_SECRET deve ter pelo menos 32 caracteres'),
    JWT_REFRESH_SECRET: zod_1.z.string().min(32, 'JWT_REFRESH_SECRET deve ter pelo menos 32 caracteres'),
    JWT_ACCESS_EXPIRES_IN: zod_1.z.string().default('15m'),
    JWT_REFRESH_EXPIRES_IN: zod_1.z.string().default('7d'),
    CORS_ORIGIN: zod_1.z.string().default('http://localhost:5173,https://cisatool.com.br,https://code-assessment-frontend.onrender.com,https://code-assessment-898z.onrender.com'),
    RATE_LIMIT_WINDOW_MS: zod_1.z.string().transform(Number).default('900000'),
    RATE_LIMIT_MAX: zod_1.z.string().transform(Number).default('100'),
    // 🔴 ADICIONADO: Google OAuth2 para Email
    GOOGLE_CLIENT_ID: zod_1.z.string().default(''),
    GOOGLE_CLIENT_SECRET: zod_1.z.string().default(''),
    GOOGLE_REFRESH_TOKEN: zod_1.z.string().default(''),
    SMTP_USER: zod_1.z.string().default('codeassessment@gmail.com'),
    SMTP_FROM: zod_1.z.string().default('Code_Assessment <codeassessment@gmail.com>'),
});
const result = envSchema.safeParse(process.env);
if (!result.success) {
    console.error('❌ Variáveis de ambiente inválidas:', result.error.format());
    process.exit(1);
}
exports.config = result.data;
//# sourceMappingURL=env.js.map