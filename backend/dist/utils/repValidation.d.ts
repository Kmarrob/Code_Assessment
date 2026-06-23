import { z } from 'zod';
export declare const repCreateUserSchema: z.ZodObject<{
    name: z.ZodString;
    email: z.ZodString;
    password: z.ZodString;
    company: z.ZodOptional<z.ZodString>;
    department: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    password: string;
    name: string;
    email: string;
    company?: string | undefined;
    department?: string | undefined;
}, {
    password: string;
    name: string;
    email: string;
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
    company: z.ZodOptional<z.ZodString>;
    department: z.ZodOptional<z.ZodString>;
    isActive: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    company?: string | undefined;
    department?: string | undefined;
    isActive?: boolean | undefined;
}, {
    name?: string | undefined;
    company?: string | undefined;
    department?: string | undefined;
    isActive?: boolean | undefined;
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