import { z } from 'zod';

// ============================================================
// SCHEMAS DE VALIDAÇÃO PARA AUDITORIA
// ============================================================

// ============================================================
// PLANO DE AUDITORIA
// ============================================================

export const createAuditPlanSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  description: z.string().min(1, 'Descrição é obrigatória'),
  scope: z.object({
    controls: z.array(z.string()),
    processes: z.array(z.string()),
    areas: z.array(z.string()),
  }),
  period: z.object({
    startDate: z.string().or(z.date()),
    endDate: z.string().or(z.date()),
  }),
  team: z.object({
    leadAuditor: z.string().min(1, 'Auditor líder é obrigatório'),
    auditors: z.array(z.string()),
    observers: z.array(z.string()).optional(),
  }),
  criteria: z.array(z.string()),
});

export const updateAuditPlanSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  scope: z.object({
    controls: z.array(z.string()).optional(),
    processes: z.array(z.string()).optional(),
    areas: z.array(z.string()).optional(),
  }).optional(),
  period: z.object({
    startDate: z.string().or(z.date()).optional(),
    endDate: z.string().or(z.date()).optional(),
  }).optional(),
  team: z.object({
    leadAuditor: z.string().optional(),
    auditors: z.array(z.string()).optional(),
    observers: z.array(z.string()).optional(),
  }).optional(),
  criteria: z.array(z.string()).optional(),
  status: z.enum(['draft', 'pending_approval', 'approved', 'in_progress', 'completed', 'cancelled']).optional(),
});

// ============================================================
// CHECKLIST
// ============================================================

export const updateChecklistSchema = z.object({
  questions: z.array(z.object({
    question: z.string(),
    answer: z.enum(['conforme', 'nao_conforme', 'nao_aplicavel']),
    observations: z.string().optional(),
    evidenceIds: z.array(z.string()).optional(),
  })),
});

// ============================================================
// NÃO CONFORMIDADE (FINDING)
// ============================================================

export const createAuditFindingSchema = z.object({
  type: z.enum(['nc_a', 'nc_b', 'comment', 'opportunity', 'positive']),
  title: z.string().min(1, 'Título é obrigatório'),
  description: z.string().min(1, 'Descrição é obrigatória'),
  area: z.string().min(1, 'Área é obrigatória'),
  clause: z.string().min(1, 'Cláusula é obrigatória'),
  evidenceIds: z.array(z.string()).optional(),
});

export const updateAuditFindingSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  area: z.string().optional(),
  clause: z.string().optional(),
  evidenceIds: z.array(z.string()).optional(),
  status: z.enum(['open', 'in_progress', 'pending_validation', 'closed', 'reopened']).optional(),
});

// ============================================================
// PLANO DE AÇÃO
// ============================================================

export const createAuditActionPlanSchema = z.object({
  findingId: z.string().min(1, 'NC é obrigatória'),
  action: z.string().min(1, 'Ação é obrigatória'),
  responsible: z.string().min(1, 'Responsável é obrigatório'),
  deadline: z.string().or(z.date()),
});

export const updateAuditActionPlanSchema = z.object({
  action: z.string().optional(),
  responsible: z.string().optional(),
  deadline: z.string().or(z.date()).optional(),
  evidenceIds: z.array(z.string()).optional(),
  status: z.enum(['pending', 'in_progress', 'completed', 'rejected']).optional(),
});

// ============================================================
// RELATÓRIO
// ============================================================

export const createAuditReportSchema = z.object({
  auditPlanId: z.string().min(1, 'Plano de auditoria é obrigatório'),
  summary: z.string().min(1, 'Resumo é obrigatório'),
  conclusion: z.string().min(1, 'Conclusão é obrigatória'),
  recommendations: z.array(z.string()),
  findings: z.array(z.string()),
});

export const updateAuditReportSchema = z.object({
  summary: z.string().optional(),
  conclusion: z.string().optional(),
  recommendations: z.array(z.string()).optional(),
  findings: z.array(z.string()).optional(),
  status: z.enum(['draft', 'pending_review', 'approved', 'rejected']).optional(),
});

// ============================================================
// EVIDÊNCIA
// ============================================================

export const uploadEvidenceSchema = z.object({
  auditPlanId: z.string().min(1, 'Plano de auditoria é obrigatório'),
  findingId: z.string().optional(),
  description: z.string().optional(),
});