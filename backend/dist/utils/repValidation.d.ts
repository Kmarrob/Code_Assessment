import { z } from 'zod';
export declare const repCreateUserSchema: z.ZodObject<{
    name: z.ZodString;
    email: z.ZodString;
    password: z.ZodOptional<z.ZodString>;
    company: z.ZodOptional<z.ZodString>;
    department: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name: string;
    email: string;
    password?: string | undefined;
    company?: string | undefined;
    department?: string | undefined;
}, {
    name: string;
    email: string;
    password?: string | undefined;
    company?: string | undefined;
    department?: string | undefined;
}>;
export declare const repAssignControlsSchema: z.ZodObject<{
    userId: z.ZodString;
    controlIds: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    userId: string;
    controlIds: string[];
}, {
    userId: string;
    controlIds: string[];
}>;
export declare const repListUsersSchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
    search: z.ZodOptional<z.ZodString>;
    status: z.ZodDefault<z.ZodEnum<["all", "active", "inactive"]>>;
}, "strip", z.ZodTypeAny, {
    status: "all" | "active" | "inactive";
    limit: number;
    page: number;
    search?: string | undefined;
}, {
    status?: "all" | "active" | "inactive" | undefined;
    limit?: number | undefined;
    search?: string | undefined;
    page?: number | undefined;
}>;
export declare const repUpdateUserSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    department: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    department?: string | undefined;
}, {
    name?: string | undefined;
    department?: string | undefined;
}>;
export declare const repInactivateUserSchema: z.ZodObject<{
    reason: z.ZodEnum<["Desligado", "Mudou de setor", "Outros"]>;
    description: z.ZodEffects<z.ZodOptional<z.ZodString>, string | undefined, string | undefined>;
}, "strip", z.ZodTypeAny, {
    reason: "Desligado" | "Mudou de setor" | "Outros";
    description?: string | undefined;
}, {
    reason: "Desligado" | "Mudou de setor" | "Outros";
    description?: string | undefined;
}>;
export declare const repRevokeControlSchema: z.ZodObject<{
    confirmRevoke: z.ZodEffects<z.ZodBoolean, boolean, boolean>;
    newUserId: z.ZodEffects<z.ZodOptional<z.ZodString>, string | undefined, string | undefined>;
}, "strip", z.ZodTypeAny, {
    confirmRevoke: boolean;
    newUserId?: string | undefined;
}, {
    confirmRevoke: boolean;
    newUserId?: string | undefined;
}>;
export declare const repResponseSchema: z.ZodObject<{
    assignmentId: z.ZodString;
    maturityLevel: z.ZodEnum<["N/A", "0", "1", "2"]>;
    scenarioDescription: z.ZodOptional<z.ZodString>;
    evidence: z.ZodOptional<z.ZodString>;
    observations: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    assignmentId: string;
    maturityLevel: "0" | "1" | "2" | "N/A";
    scenarioDescription?: string | undefined;
    evidence?: string | undefined;
    observations?: string | undefined;
}, {
    assignmentId: string;
    maturityLevel: "0" | "1" | "2" | "N/A";
    scenarioDescription?: string | undefined;
    evidence?: string | undefined;
    observations?: string | undefined;
}>;
//# sourceMappingURL=repValidation.d.ts.map