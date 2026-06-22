import { z } from 'zod';
declare const envSchema: z.ZodObject<{
    NODE_ENV: z.ZodDefault<z.ZodEnum<["development", "test", "production"]>>;
    PORT: z.ZodDefault<z.ZodEffects<z.ZodString, number, string>>;
    MONGODB_URI: z.ZodString;
    MONGODB_DB_NAME: z.ZodDefault<z.ZodString>;
    JWT_SECRET: z.ZodString;
    JWT_REFRESH_SECRET: z.ZodString;
    JWT_ACCESS_EXPIRES_IN: z.ZodDefault<z.ZodString>;
    JWT_REFRESH_EXPIRES_IN: z.ZodDefault<z.ZodString>;
    CORS_ORIGIN: z.ZodDefault<z.ZodString>;
    RATE_LIMIT_WINDOW_MS: z.ZodDefault<z.ZodEffects<z.ZodString, number, string>>;
    RATE_LIMIT_MAX: z.ZodDefault<z.ZodEffects<z.ZodString, number, string>>;
}, "strip", z.ZodTypeAny, {
    NODE_ENV: "development" | "test" | "production";
    PORT: number;
    MONGODB_URI: string;
    MONGODB_DB_NAME: string;
    JWT_SECRET: string;
    JWT_REFRESH_SECRET: string;
    JWT_ACCESS_EXPIRES_IN: string;
    JWT_REFRESH_EXPIRES_IN: string;
    CORS_ORIGIN: string;
    RATE_LIMIT_WINDOW_MS: number;
    RATE_LIMIT_MAX: number;
}, {
    MONGODB_URI: string;
    JWT_SECRET: string;
    JWT_REFRESH_SECRET: string;
    NODE_ENV?: "development" | "test" | "production" | undefined;
    PORT?: string | undefined;
    MONGODB_DB_NAME?: string | undefined;
    JWT_ACCESS_EXPIRES_IN?: string | undefined;
    JWT_REFRESH_EXPIRES_IN?: string | undefined;
    CORS_ORIGIN?: string | undefined;
    RATE_LIMIT_WINDOW_MS?: string | undefined;
    RATE_LIMIT_MAX?: string | undefined;
}>;
export declare const config: {
    NODE_ENV: "development" | "test" | "production";
    PORT: number;
    MONGODB_URI: string;
    MONGODB_DB_NAME: string;
    JWT_SECRET: string;
    JWT_REFRESH_SECRET: string;
    JWT_ACCESS_EXPIRES_IN: string;
    JWT_REFRESH_EXPIRES_IN: string;
    CORS_ORIGIN: string;
    RATE_LIMIT_WINDOW_MS: number;
    RATE_LIMIT_MAX: number;
};
export type EnvConfig = z.infer<typeof envSchema>;
export {};
//# sourceMappingURL=env.d.ts.map