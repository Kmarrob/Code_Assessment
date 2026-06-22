import { z } from 'zod';
export declare const passwordSchema: z.ZodString;
export declare const emailSchema: z.ZodString;
export declare const nameSchema: z.ZodString;
export declare const registerSchema: z.ZodObject<{
    name: z.ZodString;
    email: z.ZodString;
    password: z.ZodString;
    company: z.ZodOptional<z.ZodString>;
    department: z.ZodOptional<z.ZodString>;
    role: z.ZodOptional<z.ZodEnum<["admin", "rep", "consultant", "user"]>>;
}, "strip", z.ZodTypeAny, {
    password: string;
    name: string;
    email: string;
    role?: "admin" | "rep" | "consultant" | "user" | undefined;
    company?: string | undefined;
    department?: string | undefined;
}, {
    password: string;
    name: string;
    email: string;
    role?: "admin" | "rep" | "consultant" | "user" | undefined;
    company?: string | undefined;
    department?: string | undefined;
}>;
export declare const loginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    password: string;
    email: string;
}, {
    password: string;
    email: string;
}>;
export declare const refreshTokenSchema: z.ZodObject<{
    refreshToken: z.ZodString;
}, "strip", z.ZodTypeAny, {
    refreshToken: string;
}, {
    refreshToken: string;
}>;
export declare const updateProfileSchema: z.ZodEffects<z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    company: z.ZodOptional<z.ZodString>;
    department: z.ZodOptional<z.ZodString>;
    currentPassword: z.ZodOptional<z.ZodString>;
    newPassword: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    company?: string | undefined;
    department?: string | undefined;
    currentPassword?: string | undefined;
    newPassword?: string | undefined;
}, {
    name?: string | undefined;
    company?: string | undefined;
    department?: string | undefined;
    currentPassword?: string | undefined;
    newPassword?: string | undefined;
}>, {
    name?: string | undefined;
    company?: string | undefined;
    department?: string | undefined;
    currentPassword?: string | undefined;
    newPassword?: string | undefined;
}, {
    name?: string | undefined;
    company?: string | undefined;
    department?: string | undefined;
    currentPassword?: string | undefined;
    newPassword?: string | undefined;
}>;
export declare function validate<T>(schema: z.ZodSchema<T>, data: unknown): {
    success: true;
    data: T;
} | {
    success: false;
    errors: Record<string, string[]>;
};
export declare function sanitizeInput(input: any): any;
export declare function sanitizeOutput(data: any): any;
//# sourceMappingURL=validation.d.ts.map