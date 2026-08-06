import { z } from 'zod';

// Helper flexível para validação de datas (aceita string ISO, YYYY-MM-DD ou objetos Date)
const flexibleDateSchema = z.union([
  z.string(),
  z.date(),
]).transform((val) => {
  if (val instanceof Date) return val.toISOString();
  return new Date(val).toISOString();
});

// Base Schema
export const governanceDocumentBaseSchema = z.object({
  code: z.string().min(3).max(20),
  title: z.string().min(3).max(200),
  level: z.union([
    z.literal(1),
    z.literal(2),
    z.literal(3),
    z.literal(4),
    z.literal(5),
    z.string().transform((val) => Number(val)).refine((val) => [1, 2, 3, 4, 5].includes(val), {
      message: 'Level must be 1, 2, 3, 4, or 5',
    }),
  ]),
  category: z.string().min(3).max(100),
  content: z.string().min(10),
  summary: z.string().min(10).max(500),
  keywords: z.array(z.string()).optional(),
  effectiveDate: flexibleDateSchema,
  reviewDate: flexibleDateSchema,
  frameworks: z.object({
    iso27001: z.array(z.string()).optional(),
    nist: z.array(z.string()).optional(),
    cobit: z.array(z.string()).optional(),
    pciDss: z.array(z.string()).optional(),
    lgpd: z.array(z.string()).optional(),
    bacen: z.array(z.string()).optional(),
  }).optional(),
  // 🆕 CAMPOS ADICIONAIS PARA POLÍTICAS
  scope: z.enum(['all', 'it', 'security', 'privacy']).optional(),
  strategicObjective: z.string().min(10).optional(),
  responsible: z.string().min(3).optional(),
});

// Create DTO
export const createGovernanceDocumentSchema = governanceDocumentBaseSchema;

// Update DTO
// 🆕 CORREÇÃO v41.1: Adicionados campos faltantes no update
export const updateGovernanceDocumentSchema = z.object({
  title: z.string().min(3).max(200).optional(),
  content: z.string().min(10).optional(),
  summary: z.string().min(10).max(500).optional(),
  keywords: z.array(z.string()).optional(),
  status: z.enum(['draft', 'review', 'approved', 'archived']).optional(),
  effectiveDate: flexibleDateSchema.optional(),
  reviewDate: flexibleDateSchema.optional(),
  frameworks: z.object({
    iso27001: z.array(z.string()).optional(),
    nist: z.array(z.string()).optional(),
    cobit: z.array(z.string()).optional(),
    pciDss: z.array(z.string()).optional(),
    lgpd: z.array(z.string()).optional(),
    bacen: z.array(z.string()).optional(),
  }).optional(),
  version: z.string().optional(),
  versionChanges: z.string().optional(),
  // 🆕 Campos adicionados para permitir atualização
  category: z.string().min(3).max(100).optional(),
  scope: z.enum(['all', 'it', 'security', 'privacy']).optional(),
  strategicObjective: z.string().min(10).optional(),
  responsible: z.string().min(3).optional(),
});

// Filter Schema - Aceita string ou número
export const governanceFiltersSchema = z.object({
  level: z.union([
    z.literal(1),
    z.literal(2),
    z.literal(3),
    z.literal(4),
    z.literal(5),
    z.string().transform((val) => Number(val)).refine((val) => [1, 2, 3, 4, 5].includes(val), {
      message: 'Level must be 1, 2, 3, 4, or 5',
    }),
  ]).optional(),
  status: z.enum(['draft', 'review', 'approved', 'archived']).optional(),
  category: z.string().optional(),
  search: z.string().optional(),
  framework: z.enum(['iso27001', 'nist', 'cobit', 'pciDss', 'lgpd', 'bacen']).optional(),
});

// Policy specific
export const policySchema = governanceDocumentBaseSchema.extend({
  scope: z.enum(['all', 'it', 'security', 'privacy']),
  strategicObjective: z.string().min(10),
  responsible: z.string().min(3),
});

// Standard specific
export const standardSchema = governanceDocumentBaseSchema.extend({
  policyId: z.string(),
  mandatory: z.boolean().default(true),
  nonCompliancePenalty: z.string().optional(),
});

// Procedure specific
export const procedureSchema = governanceDocumentBaseSchema.extend({
  standardId: z.string(),
  steps: z.array(z.object({
    order: z.number().int().positive(),
    description: z.string().min(5),
    responsible: z.string().min(3),
    expectedTime: z.string().min(1),
  })),
  inputs: z.array(z.string()).default([]),
  outputs: z.array(z.string()).default([]),
});

// WorkInstruction specific
export const workInstructionSchema = governanceDocumentBaseSchema.extend({
  procedureId: z.string(),
  detailedSteps: z.string().min(10),
  tools: z.array(z.string()).default([]),
  prerequisites: z.array(z.string()).default([]),
  verificationPoints: z.array(z.string()).default([]),
});

// Record specific
export const recordSchema = governanceDocumentBaseSchema.extend({
  procedureId: z.string(),
  recordType: z.enum(['form', 'evidence', 'report', 'log']),
  retentionPeriod: z.number().int().positive().default(365),
  retentionPolicy: z.string().min(10),
});