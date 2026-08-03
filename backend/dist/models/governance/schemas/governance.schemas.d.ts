import { z } from 'zod';
export declare const governanceDocumentBaseSchema: z.ZodObject<{
    code: z.ZodString;
    title: z.ZodString;
    level: z.ZodUnion<[z.ZodLiteral<1>, z.ZodLiteral<2>, z.ZodLiteral<3>, z.ZodLiteral<4>, z.ZodLiteral<5>, z.ZodEffects<z.ZodEffects<z.ZodString, number, string>, number, string>]>;
    category: z.ZodString;
    content: z.ZodString;
    summary: z.ZodString;
    keywords: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    effectiveDate: z.ZodEffects<z.ZodUnion<[z.ZodString, z.ZodDate]>, string, string | Date>;
    reviewDate: z.ZodEffects<z.ZodUnion<[z.ZodString, z.ZodDate]>, string, string | Date>;
    frameworks: z.ZodOptional<z.ZodObject<{
        iso27001: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        nist: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        cobit: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        pciDss: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        lgpd: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        bacen: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        iso27001?: string[] | undefined;
        nist?: string[] | undefined;
        cobit?: string[] | undefined;
        pciDss?: string[] | undefined;
        lgpd?: string[] | undefined;
        bacen?: string[] | undefined;
    }, {
        iso27001?: string[] | undefined;
        nist?: string[] | undefined;
        cobit?: string[] | undefined;
        pciDss?: string[] | undefined;
        lgpd?: string[] | undefined;
        bacen?: string[] | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    code: string;
    level: number;
    title: string;
    category: string;
    summary: string;
    content: string;
    effectiveDate: string;
    reviewDate: string;
    keywords?: string[] | undefined;
    frameworks?: {
        iso27001?: string[] | undefined;
        nist?: string[] | undefined;
        cobit?: string[] | undefined;
        pciDss?: string[] | undefined;
        lgpd?: string[] | undefined;
        bacen?: string[] | undefined;
    } | undefined;
}, {
    code: string;
    level: string | 3 | 1 | 2 | 4 | 5;
    title: string;
    category: string;
    summary: string;
    content: string;
    effectiveDate: string | Date;
    reviewDate: string | Date;
    keywords?: string[] | undefined;
    frameworks?: {
        iso27001?: string[] | undefined;
        nist?: string[] | undefined;
        cobit?: string[] | undefined;
        pciDss?: string[] | undefined;
        lgpd?: string[] | undefined;
        bacen?: string[] | undefined;
    } | undefined;
}>;
export declare const createGovernanceDocumentSchema: z.ZodObject<{
    code: z.ZodString;
    title: z.ZodString;
    level: z.ZodUnion<[z.ZodLiteral<1>, z.ZodLiteral<2>, z.ZodLiteral<3>, z.ZodLiteral<4>, z.ZodLiteral<5>, z.ZodEffects<z.ZodEffects<z.ZodString, number, string>, number, string>]>;
    category: z.ZodString;
    content: z.ZodString;
    summary: z.ZodString;
    keywords: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    effectiveDate: z.ZodEffects<z.ZodUnion<[z.ZodString, z.ZodDate]>, string, string | Date>;
    reviewDate: z.ZodEffects<z.ZodUnion<[z.ZodString, z.ZodDate]>, string, string | Date>;
    frameworks: z.ZodOptional<z.ZodObject<{
        iso27001: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        nist: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        cobit: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        pciDss: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        lgpd: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        bacen: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        iso27001?: string[] | undefined;
        nist?: string[] | undefined;
        cobit?: string[] | undefined;
        pciDss?: string[] | undefined;
        lgpd?: string[] | undefined;
        bacen?: string[] | undefined;
    }, {
        iso27001?: string[] | undefined;
        nist?: string[] | undefined;
        cobit?: string[] | undefined;
        pciDss?: string[] | undefined;
        lgpd?: string[] | undefined;
        bacen?: string[] | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    code: string;
    level: number;
    title: string;
    category: string;
    summary: string;
    content: string;
    effectiveDate: string;
    reviewDate: string;
    keywords?: string[] | undefined;
    frameworks?: {
        iso27001?: string[] | undefined;
        nist?: string[] | undefined;
        cobit?: string[] | undefined;
        pciDss?: string[] | undefined;
        lgpd?: string[] | undefined;
        bacen?: string[] | undefined;
    } | undefined;
}, {
    code: string;
    level: string | 3 | 1 | 2 | 4 | 5;
    title: string;
    category: string;
    summary: string;
    content: string;
    effectiveDate: string | Date;
    reviewDate: string | Date;
    keywords?: string[] | undefined;
    frameworks?: {
        iso27001?: string[] | undefined;
        nist?: string[] | undefined;
        cobit?: string[] | undefined;
        pciDss?: string[] | undefined;
        lgpd?: string[] | undefined;
        bacen?: string[] | undefined;
    } | undefined;
}>;
export declare const updateGovernanceDocumentSchema: z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    content: z.ZodOptional<z.ZodString>;
    summary: z.ZodOptional<z.ZodString>;
    keywords: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    status: z.ZodOptional<z.ZodEnum<["draft", "review", "approved", "archived"]>>;
    effectiveDate: z.ZodOptional<z.ZodEffects<z.ZodUnion<[z.ZodString, z.ZodDate]>, string, string | Date>>;
    reviewDate: z.ZodOptional<z.ZodEffects<z.ZodUnion<[z.ZodString, z.ZodDate]>, string, string | Date>>;
    frameworks: z.ZodOptional<z.ZodObject<{
        iso27001: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        nist: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        cobit: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        pciDss: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        lgpd: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        bacen: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        iso27001?: string[] | undefined;
        nist?: string[] | undefined;
        cobit?: string[] | undefined;
        pciDss?: string[] | undefined;
        lgpd?: string[] | undefined;
        bacen?: string[] | undefined;
    }, {
        iso27001?: string[] | undefined;
        nist?: string[] | undefined;
        cobit?: string[] | undefined;
        pciDss?: string[] | undefined;
        lgpd?: string[] | undefined;
        bacen?: string[] | undefined;
    }>>;
    version: z.ZodOptional<z.ZodString>;
    versionChanges: z.ZodOptional<z.ZodString>;
    category: z.ZodOptional<z.ZodString>;
    scope: z.ZodOptional<z.ZodEnum<["all", "it", "security", "privacy"]>>;
    strategicObjective: z.ZodOptional<z.ZodString>;
    responsible: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    status?: "approved" | "draft" | "archived" | "review" | undefined;
    version?: string | undefined;
    title?: string | undefined;
    category?: string | undefined;
    summary?: string | undefined;
    scope?: "all" | "it" | "security" | "privacy" | undefined;
    content?: string | undefined;
    keywords?: string[] | undefined;
    effectiveDate?: string | undefined;
    reviewDate?: string | undefined;
    frameworks?: {
        iso27001?: string[] | undefined;
        nist?: string[] | undefined;
        cobit?: string[] | undefined;
        pciDss?: string[] | undefined;
        lgpd?: string[] | undefined;
        bacen?: string[] | undefined;
    } | undefined;
    versionChanges?: string | undefined;
    strategicObjective?: string | undefined;
    responsible?: string | undefined;
}, {
    status?: "approved" | "draft" | "archived" | "review" | undefined;
    version?: string | undefined;
    title?: string | undefined;
    category?: string | undefined;
    summary?: string | undefined;
    scope?: "all" | "it" | "security" | "privacy" | undefined;
    content?: string | undefined;
    keywords?: string[] | undefined;
    effectiveDate?: string | Date | undefined;
    reviewDate?: string | Date | undefined;
    frameworks?: {
        iso27001?: string[] | undefined;
        nist?: string[] | undefined;
        cobit?: string[] | undefined;
        pciDss?: string[] | undefined;
        lgpd?: string[] | undefined;
        bacen?: string[] | undefined;
    } | undefined;
    versionChanges?: string | undefined;
    strategicObjective?: string | undefined;
    responsible?: string | undefined;
}>;
export declare const governanceFiltersSchema: z.ZodObject<{
    level: z.ZodOptional<z.ZodUnion<[z.ZodLiteral<1>, z.ZodLiteral<2>, z.ZodLiteral<3>, z.ZodLiteral<4>, z.ZodLiteral<5>, z.ZodEffects<z.ZodEffects<z.ZodString, number, string>, number, string>]>>;
    status: z.ZodOptional<z.ZodEnum<["draft", "review", "approved", "archived"]>>;
    category: z.ZodOptional<z.ZodString>;
    search: z.ZodOptional<z.ZodString>;
    framework: z.ZodOptional<z.ZodEnum<["iso27001", "nist", "cobit", "pciDss", "lgpd", "bacen"]>>;
}, "strip", z.ZodTypeAny, {
    status?: "approved" | "draft" | "archived" | "review" | undefined;
    level?: number | undefined;
    search?: string | undefined;
    category?: string | undefined;
    framework?: "iso27001" | "nist" | "cobit" | "pciDss" | "lgpd" | "bacen" | undefined;
}, {
    status?: "approved" | "draft" | "archived" | "review" | undefined;
    level?: string | 3 | 1 | 2 | 4 | 5 | undefined;
    search?: string | undefined;
    category?: string | undefined;
    framework?: "iso27001" | "nist" | "cobit" | "pciDss" | "lgpd" | "bacen" | undefined;
}>;
export declare const policySchema: z.ZodObject<{
    code: z.ZodString;
    title: z.ZodString;
    level: z.ZodUnion<[z.ZodLiteral<1>, z.ZodLiteral<2>, z.ZodLiteral<3>, z.ZodLiteral<4>, z.ZodLiteral<5>, z.ZodEffects<z.ZodEffects<z.ZodString, number, string>, number, string>]>;
    category: z.ZodString;
    content: z.ZodString;
    summary: z.ZodString;
    keywords: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    effectiveDate: z.ZodEffects<z.ZodUnion<[z.ZodString, z.ZodDate]>, string, string | Date>;
    reviewDate: z.ZodEffects<z.ZodUnion<[z.ZodString, z.ZodDate]>, string, string | Date>;
    frameworks: z.ZodOptional<z.ZodObject<{
        iso27001: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        nist: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        cobit: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        pciDss: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        lgpd: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        bacen: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        iso27001?: string[] | undefined;
        nist?: string[] | undefined;
        cobit?: string[] | undefined;
        pciDss?: string[] | undefined;
        lgpd?: string[] | undefined;
        bacen?: string[] | undefined;
    }, {
        iso27001?: string[] | undefined;
        nist?: string[] | undefined;
        cobit?: string[] | undefined;
        pciDss?: string[] | undefined;
        lgpd?: string[] | undefined;
        bacen?: string[] | undefined;
    }>>;
} & {
    scope: z.ZodEnum<["all", "it", "security", "privacy"]>;
    strategicObjective: z.ZodString;
    responsible: z.ZodString;
}, "strip", z.ZodTypeAny, {
    code: string;
    level: number;
    title: string;
    category: string;
    summary: string;
    scope: "all" | "it" | "security" | "privacy";
    content: string;
    effectiveDate: string;
    reviewDate: string;
    strategicObjective: string;
    responsible: string;
    keywords?: string[] | undefined;
    frameworks?: {
        iso27001?: string[] | undefined;
        nist?: string[] | undefined;
        cobit?: string[] | undefined;
        pciDss?: string[] | undefined;
        lgpd?: string[] | undefined;
        bacen?: string[] | undefined;
    } | undefined;
}, {
    code: string;
    level: string | 3 | 1 | 2 | 4 | 5;
    title: string;
    category: string;
    summary: string;
    scope: "all" | "it" | "security" | "privacy";
    content: string;
    effectiveDate: string | Date;
    reviewDate: string | Date;
    strategicObjective: string;
    responsible: string;
    keywords?: string[] | undefined;
    frameworks?: {
        iso27001?: string[] | undefined;
        nist?: string[] | undefined;
        cobit?: string[] | undefined;
        pciDss?: string[] | undefined;
        lgpd?: string[] | undefined;
        bacen?: string[] | undefined;
    } | undefined;
}>;
export declare const standardSchema: z.ZodObject<{
    code: z.ZodString;
    title: z.ZodString;
    level: z.ZodUnion<[z.ZodLiteral<1>, z.ZodLiteral<2>, z.ZodLiteral<3>, z.ZodLiteral<4>, z.ZodLiteral<5>, z.ZodEffects<z.ZodEffects<z.ZodString, number, string>, number, string>]>;
    category: z.ZodString;
    content: z.ZodString;
    summary: z.ZodString;
    keywords: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    effectiveDate: z.ZodEffects<z.ZodUnion<[z.ZodString, z.ZodDate]>, string, string | Date>;
    reviewDate: z.ZodEffects<z.ZodUnion<[z.ZodString, z.ZodDate]>, string, string | Date>;
    frameworks: z.ZodOptional<z.ZodObject<{
        iso27001: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        nist: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        cobit: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        pciDss: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        lgpd: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        bacen: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        iso27001?: string[] | undefined;
        nist?: string[] | undefined;
        cobit?: string[] | undefined;
        pciDss?: string[] | undefined;
        lgpd?: string[] | undefined;
        bacen?: string[] | undefined;
    }, {
        iso27001?: string[] | undefined;
        nist?: string[] | undefined;
        cobit?: string[] | undefined;
        pciDss?: string[] | undefined;
        lgpd?: string[] | undefined;
        bacen?: string[] | undefined;
    }>>;
} & {
    policyId: z.ZodString;
    mandatory: z.ZodDefault<z.ZodBoolean>;
    nonCompliancePenalty: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    code: string;
    level: number;
    title: string;
    category: string;
    summary: string;
    content: string;
    effectiveDate: string;
    reviewDate: string;
    policyId: string;
    mandatory: boolean;
    keywords?: string[] | undefined;
    frameworks?: {
        iso27001?: string[] | undefined;
        nist?: string[] | undefined;
        cobit?: string[] | undefined;
        pciDss?: string[] | undefined;
        lgpd?: string[] | undefined;
        bacen?: string[] | undefined;
    } | undefined;
    nonCompliancePenalty?: string | undefined;
}, {
    code: string;
    level: string | 3 | 1 | 2 | 4 | 5;
    title: string;
    category: string;
    summary: string;
    content: string;
    effectiveDate: string | Date;
    reviewDate: string | Date;
    policyId: string;
    keywords?: string[] | undefined;
    frameworks?: {
        iso27001?: string[] | undefined;
        nist?: string[] | undefined;
        cobit?: string[] | undefined;
        pciDss?: string[] | undefined;
        lgpd?: string[] | undefined;
        bacen?: string[] | undefined;
    } | undefined;
    mandatory?: boolean | undefined;
    nonCompliancePenalty?: string | undefined;
}>;
export declare const procedureSchema: z.ZodObject<{
    code: z.ZodString;
    title: z.ZodString;
    level: z.ZodUnion<[z.ZodLiteral<1>, z.ZodLiteral<2>, z.ZodLiteral<3>, z.ZodLiteral<4>, z.ZodLiteral<5>, z.ZodEffects<z.ZodEffects<z.ZodString, number, string>, number, string>]>;
    category: z.ZodString;
    content: z.ZodString;
    summary: z.ZodString;
    keywords: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    effectiveDate: z.ZodEffects<z.ZodUnion<[z.ZodString, z.ZodDate]>, string, string | Date>;
    reviewDate: z.ZodEffects<z.ZodUnion<[z.ZodString, z.ZodDate]>, string, string | Date>;
    frameworks: z.ZodOptional<z.ZodObject<{
        iso27001: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        nist: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        cobit: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        pciDss: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        lgpd: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        bacen: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        iso27001?: string[] | undefined;
        nist?: string[] | undefined;
        cobit?: string[] | undefined;
        pciDss?: string[] | undefined;
        lgpd?: string[] | undefined;
        bacen?: string[] | undefined;
    }, {
        iso27001?: string[] | undefined;
        nist?: string[] | undefined;
        cobit?: string[] | undefined;
        pciDss?: string[] | undefined;
        lgpd?: string[] | undefined;
        bacen?: string[] | undefined;
    }>>;
} & {
    standardId: z.ZodString;
    steps: z.ZodArray<z.ZodObject<{
        order: z.ZodNumber;
        description: z.ZodString;
        responsible: z.ZodString;
        expectedTime: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        description: string;
        order: number;
        responsible: string;
        expectedTime: string;
    }, {
        description: string;
        order: number;
        responsible: string;
        expectedTime: string;
    }>, "many">;
    inputs: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    outputs: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    code: string;
    level: number;
    title: string;
    category: string;
    summary: string;
    steps: {
        description: string;
        order: number;
        responsible: string;
        expectedTime: string;
    }[];
    content: string;
    effectiveDate: string;
    reviewDate: string;
    standardId: string;
    inputs: string[];
    outputs: string[];
    keywords?: string[] | undefined;
    frameworks?: {
        iso27001?: string[] | undefined;
        nist?: string[] | undefined;
        cobit?: string[] | undefined;
        pciDss?: string[] | undefined;
        lgpd?: string[] | undefined;
        bacen?: string[] | undefined;
    } | undefined;
}, {
    code: string;
    level: string | 3 | 1 | 2 | 4 | 5;
    title: string;
    category: string;
    summary: string;
    steps: {
        description: string;
        order: number;
        responsible: string;
        expectedTime: string;
    }[];
    content: string;
    effectiveDate: string | Date;
    reviewDate: string | Date;
    standardId: string;
    keywords?: string[] | undefined;
    frameworks?: {
        iso27001?: string[] | undefined;
        nist?: string[] | undefined;
        cobit?: string[] | undefined;
        pciDss?: string[] | undefined;
        lgpd?: string[] | undefined;
        bacen?: string[] | undefined;
    } | undefined;
    inputs?: string[] | undefined;
    outputs?: string[] | undefined;
}>;
export declare const workInstructionSchema: z.ZodObject<{
    code: z.ZodString;
    title: z.ZodString;
    level: z.ZodUnion<[z.ZodLiteral<1>, z.ZodLiteral<2>, z.ZodLiteral<3>, z.ZodLiteral<4>, z.ZodLiteral<5>, z.ZodEffects<z.ZodEffects<z.ZodString, number, string>, number, string>]>;
    category: z.ZodString;
    content: z.ZodString;
    summary: z.ZodString;
    keywords: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    effectiveDate: z.ZodEffects<z.ZodUnion<[z.ZodString, z.ZodDate]>, string, string | Date>;
    reviewDate: z.ZodEffects<z.ZodUnion<[z.ZodString, z.ZodDate]>, string, string | Date>;
    frameworks: z.ZodOptional<z.ZodObject<{
        iso27001: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        nist: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        cobit: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        pciDss: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        lgpd: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        bacen: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        iso27001?: string[] | undefined;
        nist?: string[] | undefined;
        cobit?: string[] | undefined;
        pciDss?: string[] | undefined;
        lgpd?: string[] | undefined;
        bacen?: string[] | undefined;
    }, {
        iso27001?: string[] | undefined;
        nist?: string[] | undefined;
        cobit?: string[] | undefined;
        pciDss?: string[] | undefined;
        lgpd?: string[] | undefined;
        bacen?: string[] | undefined;
    }>>;
} & {
    procedureId: z.ZodString;
    detailedSteps: z.ZodString;
    tools: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    prerequisites: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    verificationPoints: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    code: string;
    level: number;
    title: string;
    category: string;
    summary: string;
    content: string;
    effectiveDate: string;
    reviewDate: string;
    procedureId: string;
    detailedSteps: string;
    tools: string[];
    prerequisites: string[];
    verificationPoints: string[];
    keywords?: string[] | undefined;
    frameworks?: {
        iso27001?: string[] | undefined;
        nist?: string[] | undefined;
        cobit?: string[] | undefined;
        pciDss?: string[] | undefined;
        lgpd?: string[] | undefined;
        bacen?: string[] | undefined;
    } | undefined;
}, {
    code: string;
    level: string | 3 | 1 | 2 | 4 | 5;
    title: string;
    category: string;
    summary: string;
    content: string;
    effectiveDate: string | Date;
    reviewDate: string | Date;
    procedureId: string;
    detailedSteps: string;
    keywords?: string[] | undefined;
    frameworks?: {
        iso27001?: string[] | undefined;
        nist?: string[] | undefined;
        cobit?: string[] | undefined;
        pciDss?: string[] | undefined;
        lgpd?: string[] | undefined;
        bacen?: string[] | undefined;
    } | undefined;
    tools?: string[] | undefined;
    prerequisites?: string[] | undefined;
    verificationPoints?: string[] | undefined;
}>;
export declare const recordSchema: z.ZodObject<{
    code: z.ZodString;
    title: z.ZodString;
    level: z.ZodUnion<[z.ZodLiteral<1>, z.ZodLiteral<2>, z.ZodLiteral<3>, z.ZodLiteral<4>, z.ZodLiteral<5>, z.ZodEffects<z.ZodEffects<z.ZodString, number, string>, number, string>]>;
    category: z.ZodString;
    content: z.ZodString;
    summary: z.ZodString;
    keywords: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    effectiveDate: z.ZodEffects<z.ZodUnion<[z.ZodString, z.ZodDate]>, string, string | Date>;
    reviewDate: z.ZodEffects<z.ZodUnion<[z.ZodString, z.ZodDate]>, string, string | Date>;
    frameworks: z.ZodOptional<z.ZodObject<{
        iso27001: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        nist: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        cobit: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        pciDss: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        lgpd: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        bacen: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        iso27001?: string[] | undefined;
        nist?: string[] | undefined;
        cobit?: string[] | undefined;
        pciDss?: string[] | undefined;
        lgpd?: string[] | undefined;
        bacen?: string[] | undefined;
    }, {
        iso27001?: string[] | undefined;
        nist?: string[] | undefined;
        cobit?: string[] | undefined;
        pciDss?: string[] | undefined;
        lgpd?: string[] | undefined;
        bacen?: string[] | undefined;
    }>>;
} & {
    procedureId: z.ZodString;
    recordType: z.ZodEnum<["form", "evidence", "report", "log"]>;
    retentionPeriod: z.ZodDefault<z.ZodNumber>;
    retentionPolicy: z.ZodString;
}, "strip", z.ZodTypeAny, {
    code: string;
    level: number;
    title: string;
    category: string;
    summary: string;
    content: string;
    effectiveDate: string;
    reviewDate: string;
    procedureId: string;
    recordType: "evidence" | "form" | "report" | "log";
    retentionPeriod: number;
    retentionPolicy: string;
    keywords?: string[] | undefined;
    frameworks?: {
        iso27001?: string[] | undefined;
        nist?: string[] | undefined;
        cobit?: string[] | undefined;
        pciDss?: string[] | undefined;
        lgpd?: string[] | undefined;
        bacen?: string[] | undefined;
    } | undefined;
}, {
    code: string;
    level: string | 3 | 1 | 2 | 4 | 5;
    title: string;
    category: string;
    summary: string;
    content: string;
    effectiveDate: string | Date;
    reviewDate: string | Date;
    procedureId: string;
    recordType: "evidence" | "form" | "report" | "log";
    retentionPolicy: string;
    keywords?: string[] | undefined;
    frameworks?: {
        iso27001?: string[] | undefined;
        nist?: string[] | undefined;
        cobit?: string[] | undefined;
        pciDss?: string[] | undefined;
        lgpd?: string[] | undefined;
        bacen?: string[] | undefined;
    } | undefined;
    retentionPeriod?: number | undefined;
}>;
//# sourceMappingURL=governance.schemas.d.ts.map