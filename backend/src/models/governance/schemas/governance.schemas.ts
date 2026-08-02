import { z } from 'zod';

// Base Schema
export const governanceDocumentBaseSchema = z.object({
  code: z.string().min(3).max(20),
  title: z.string().min(3).max(200),
  level: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]),
  category: z.string().min(3).max(100),
  content: z.string().min(10),
  summary: z.string().min(10).max(500),
  keywords: z.array(z.string()).optional(),
  effectiveDate: z.string().datetime(),
  reviewDate: z.string().datetime(),
  frameworks: z.object({
    iso27001: z.array(z.string()).optional(),
    nist: z.array(z.string()).optional(),
    cobit: z.array(z.string()).optional(),
    pciDss: z.array(z.string()).optional(),
    lgpd: z.array(z.string()).optional(),
    bacen: z.array(z.string()).optional(),
  }).optional(),
});

// Create DTO
export const createGovernanceDocumentSchema = governanceDocumentBaseSchema;

// Update DTO
export const updateGovernanceDocumentSchema = z.object({
  title: z.string().min(3).max(200).optional(),
  content: z.string().min(10).optional(),
  summary: z.string().min(10).max(500).optional(),
  keywords: z.array(z.string()).optional(),
  status: z.enum(['draft', 'review', 'approved', 'archived']).optional(),
  effectiveDate: z.string().datetime().optional(),
  reviewDate: z.string().datetime().optional(),
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
});

// Filter Schema
export const governanceFiltersSchema = z.object({
  level: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]).optional(),
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