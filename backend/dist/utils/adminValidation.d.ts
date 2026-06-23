import { z } from 'zod';
export declare const adminPasswordSchema: z.ZodString;
export declare const adminEmailSchema: z.ZodString;
export declare const adminNameSchema: z.ZodString;
export declare const adminRoleSchema: z.ZodEnum<["admin", "rep", "consultant", "user"]>;
export declare const adminCreateUserSchema: z.ZodObject<{
    name: z.ZodString;
    email: z.ZodString;
    password: z.ZodString;
    role: z.ZodDefault<z.ZodEnum<["admin", "rep", "consultant", "user"]>>;
    company: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    companyId: z.ZodEffects<z.ZodUnion<[z.ZodNullable<z.ZodOptional<z.ZodString>>, z.ZodLiteral<"">]>, string | null | undefined, string | null | undefined>;
    department: z.ZodNullable<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    password: string;
    name: string;
    email: string;
    role: "admin" | "rep" | "consultant" | "user";
    company?: string | null | undefined;
    companyId?: string | null | undefined;
    department?: string | null | undefined;
}, {
    password: string;
    name: string;
    email: string;
    role?: "admin" | "rep" | "consultant" | "user" | undefined;
    company?: string | null | undefined;
    companyId?: string | null | undefined;
    department?: string | null | undefined;
}>;
export declare const adminUpdateUserSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodString>;
    role: z.ZodOptional<z.ZodEnum<["admin", "rep", "consultant", "user"]>>;
    company: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    companyId: z.ZodEffects<z.ZodUnion<[z.ZodNullable<z.ZodOptional<z.ZodString>>, z.ZodLiteral<"">]>, string | null | undefined, string | null | undefined>;
    department: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    isActive: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    email?: string | undefined;
    role?: "admin" | "rep" | "consultant" | "user" | undefined;
    company?: string | null | undefined;
    companyId?: string | null | undefined;
    department?: string | null | undefined;
    isActive?: boolean | undefined;
}, {
    name?: string | undefined;
    email?: string | undefined;
    role?: "admin" | "rep" | "consultant" | "user" | undefined;
    company?: string | null | undefined;
    companyId?: string | null | undefined;
    department?: string | null | undefined;
    isActive?: boolean | undefined;
}>;
export declare const adminListUsersSchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
    role: z.ZodOptional<z.ZodEnum<["admin", "rep", "consultant", "user"]>>;
    isActive: z.ZodOptional<z.ZodBoolean>;
    search: z.ZodOptional<z.ZodString>;
    company: z.ZodOptional<z.ZodString>;
    companyId: z.ZodOptional<z.ZodString>;
    department: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    page: number;
    role?: "admin" | "rep" | "consultant" | "user" | undefined;
    company?: string | undefined;
    companyId?: string | undefined;
    department?: string | undefined;
    isActive?: boolean | undefined;
    search?: string | undefined;
}, {
    limit?: number | undefined;
    role?: "admin" | "rep" | "consultant" | "user" | undefined;
    company?: string | undefined;
    companyId?: string | undefined;
    department?: string | undefined;
    isActive?: boolean | undefined;
    search?: string | undefined;
    page?: number | undefined;
}>;
export declare const adminResetPasswordSchema: z.ZodObject<{
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    password: string;
}, {
    password: string;
}>;
//# sourceMappingURL=adminValidation.d.ts.map