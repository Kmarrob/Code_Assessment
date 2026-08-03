"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.recordSchema = exports.workInstructionSchema = exports.procedureSchema = exports.standardSchema = exports.policySchema = exports.governanceFiltersSchema = exports.updateGovernanceDocumentSchema = exports.createGovernanceDocumentSchema = exports.governanceDocumentBaseSchema = void 0;
const zod_1 = require("zod");
// Helper flexível para validação de datas (aceita string ISO, YYYY-MM-DD ou objetos Date)
const flexibleDateSchema = zod_1.z.union([
    zod_1.z.string(),
    zod_1.z.date(),
]).transform((val) => {
    if (val instanceof Date)
        return val.toISOString();
    return new Date(val).toISOString();
});
// Base Schema
exports.governanceDocumentBaseSchema = zod_1.z.object({
    code: zod_1.z.string().min(3).max(20),
    title: zod_1.z.string().min(3).max(200),
    level: zod_1.z.union([
        zod_1.z.literal(1),
        zod_1.z.literal(2),
        zod_1.z.literal(3),
        zod_1.z.literal(4),
        zod_1.z.literal(5),
        zod_1.z.string().transform((val) => Number(val)).refine((val) => [1, 2, 3, 4, 5].includes(val), {
            message: 'Level must be 1, 2, 3, 4, or 5',
        }),
    ]),
    category: zod_1.z.string().min(3).max(100),
    content: zod_1.z.string().min(10),
    summary: zod_1.z.string().min(10).max(500),
    keywords: zod_1.z.array(zod_1.z.string()).optional(),
    effectiveDate: flexibleDateSchema,
    reviewDate: flexibleDateSchema,
    frameworks: zod_1.z.object({
        iso27001: zod_1.z.array(zod_1.z.string()).optional(),
        nist: zod_1.z.array(zod_1.z.string()).optional(),
        cobit: zod_1.z.array(zod_1.z.string()).optional(),
        pciDss: zod_1.z.array(zod_1.z.string()).optional(),
        lgpd: zod_1.z.array(zod_1.z.string()).optional(),
        bacen: zod_1.z.array(zod_1.z.string()).optional(),
    }).optional(),
});
// Create DTO
exports.createGovernanceDocumentSchema = exports.governanceDocumentBaseSchema;
// Update DTO
// 🆕 CORREÇÃO v41.1: Adicionados campos faltantes no update
exports.updateGovernanceDocumentSchema = zod_1.z.object({
    title: zod_1.z.string().min(3).max(200).optional(),
    content: zod_1.z.string().min(10).optional(),
    summary: zod_1.z.string().min(10).max(500).optional(),
    keywords: zod_1.z.array(zod_1.z.string()).optional(),
    status: zod_1.z.enum(['draft', 'review', 'approved', 'archived']).optional(),
    effectiveDate: flexibleDateSchema.optional(),
    reviewDate: flexibleDateSchema.optional(),
    frameworks: zod_1.z.object({
        iso27001: zod_1.z.array(zod_1.z.string()).optional(),
        nist: zod_1.z.array(zod_1.z.string()).optional(),
        cobit: zod_1.z.array(zod_1.z.string()).optional(),
        pciDss: zod_1.z.array(zod_1.z.string()).optional(),
        lgpd: zod_1.z.array(zod_1.z.string()).optional(),
        bacen: zod_1.z.array(zod_1.z.string()).optional(),
    }).optional(),
    version: zod_1.z.string().optional(),
    versionChanges: zod_1.z.string().optional(),
    // 🆕 Campos adicionados para permitir atualização
    category: zod_1.z.string().min(3).max(100).optional(),
    scope: zod_1.z.enum(['all', 'it', 'security', 'privacy']).optional(),
    strategicObjective: zod_1.z.string().min(10).optional(),
    responsible: zod_1.z.string().min(3).optional(),
});
// Filter Schema - Aceita string ou número
exports.governanceFiltersSchema = zod_1.z.object({
    level: zod_1.z.union([
        zod_1.z.literal(1),
        zod_1.z.literal(2),
        zod_1.z.literal(3),
        zod_1.z.literal(4),
        zod_1.z.literal(5),
        zod_1.z.string().transform((val) => Number(val)).refine((val) => [1, 2, 3, 4, 5].includes(val), {
            message: 'Level must be 1, 2, 3, 4, or 5',
        }),
    ]).optional(),
    status: zod_1.z.enum(['draft', 'review', 'approved', 'archived']).optional(),
    category: zod_1.z.string().optional(),
    search: zod_1.z.string().optional(),
    framework: zod_1.z.enum(['iso27001', 'nist', 'cobit', 'pciDss', 'lgpd', 'bacen']).optional(),
});
// Policy specific
exports.policySchema = exports.governanceDocumentBaseSchema.extend({
    scope: zod_1.z.enum(['all', 'it', 'security', 'privacy']),
    strategicObjective: zod_1.z.string().min(10),
    responsible: zod_1.z.string().min(3),
});
// Standard specific
exports.standardSchema = exports.governanceDocumentBaseSchema.extend({
    policyId: zod_1.z.string(),
    mandatory: zod_1.z.boolean().default(true),
    nonCompliancePenalty: zod_1.z.string().optional(),
});
// Procedure specific
exports.procedureSchema = exports.governanceDocumentBaseSchema.extend({
    standardId: zod_1.z.string(),
    steps: zod_1.z.array(zod_1.z.object({
        order: zod_1.z.number().int().positive(),
        description: zod_1.z.string().min(5),
        responsible: zod_1.z.string().min(3),
        expectedTime: zod_1.z.string().min(1),
    })),
    inputs: zod_1.z.array(zod_1.z.string()).default([]),
    outputs: zod_1.z.array(zod_1.z.string()).default([]),
});
// WorkInstruction specific
exports.workInstructionSchema = exports.governanceDocumentBaseSchema.extend({
    procedureId: zod_1.z.string(),
    detailedSteps: zod_1.z.string().min(10),
    tools: zod_1.z.array(zod_1.z.string()).default([]),
    prerequisites: zod_1.z.array(zod_1.z.string()).default([]),
    verificationPoints: zod_1.z.array(zod_1.z.string()).default([]),
});
// Record specific
exports.recordSchema = exports.governanceDocumentBaseSchema.extend({
    procedureId: zod_1.z.string(),
    recordType: zod_1.z.enum(['form', 'evidence', 'report', 'log']),
    retentionPeriod: zod_1.z.number().int().positive().default(365),
    retentionPolicy: zod_1.z.string().min(10),
});
//# sourceMappingURL=governance.schemas.js.map