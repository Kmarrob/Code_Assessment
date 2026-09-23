import { z } from 'zod';

// ============================================================
// SCHEMAS EXISTENTES (MANTER)
// ============================================================

/**
 * Schema para criação de um controle excluído do escopo.
 *
 * Usado no createAuditPlanSchema para aceitar exclusões
 * enviadas junto com o payload do plano.
 */
const excludedControlPayloadSchema = z.object({
  controlId: z.string().min(1, 'ID do controle é obrigatório'),
  reason: z
    .string()
    .min(20, 'A justificativa da exclusão deve ter no mínimo 20 caracteres')
    .max(1000, 'A justificativa não pode exceder 1000 caracteres'),
});

// ============================================================
// 🆕 v49.1 — createAuditPlanSchema EXPANDIDO
// ============================================================
//
// MOTIVO:
//   O frontend (AuditPlanForm.tsx) agora envia, além dos IDs
//   dos auditores, os nomes e emails resolvidos. Precisamos
//   aceitar esses campos no schema, senão o Zod os descarta
//   silenciosamente antes de chegar ao service.
//
// COMPATIBILIDADE:
//   Todos os campos novos são .optional(). Chamadas antigas
//   (só com IDs) continuam válidas.
//
// NOTA SOBRE leadAuditorEmail:
//   Aceita .email() válido OU string vazia (para auditores
//   manuais sem email). Uso de .or(z.literal('')) garante
//   que '' passe na validação sem erro.
//
// ============================================================

export const createAuditPlanSchema = z.object({
  title: z.string().min(3, 'Título deve ter no mínimo 3 caracteres'),
  description: z.string().min(10, 'Descrição deve ter no mínimo 10 caracteres'),
  companyId: z.string(),
  programId: z.string().optional(),

  /**
   * Escopo do plano de auditoria.
   *
   * - mode 'all' (padrão): todos os controles da empresa.
   *   Neste caso, scope.controls pode vir vazio (o service popula).
   *   Exclusões são feitas via scope.excludedControls.
   *
   * - mode 'custom': apenas os controles informados em controls.
   *   Neste caso, scope.controls é obrigatório e não vazio.
   */
  scope: z
    .object({
      mode: z.enum(['all', 'custom']).optional().default('all'),
      controls: z.array(z.string()).optional().default([]),

      /**
       * Exclusões enviadas junto com o payload.
       * O service processa cada uma para gerar IAuditExcludedControl
       * com excludedBy e excludedAt preenchidos.
       */
      excludedControls: z
        .array(excludedControlPayloadSchema)
        .optional()
        .default([]),

      processes: z.array(z.string()),
      areas: z.array(z.string()),
    })
    .refine(
      (data) => {
        // Em modo 'custom', pelo menos 1 controle é obrigatório
        if (data.mode === 'custom') {
          return data.controls && data.controls.length > 0;
        }
        return true;
      },
      {
        message: 'Modo "custom" requer pelo menos 1 controle em scope.controls',
        path: ['controls'],
      }
    ),

  // ============================================================
  // 🆕 v49.1 — TEAM EXPANDIDO
  // ============================================================
  //
  // Os 6 campos novos (leadAuditorName, leadAuditorEmail,
  // auditorNames, auditorEmails, observerNames, observerEmails)
  // são todos OPCIONAIS.
  //
  // O frontend (BLOCO 2) enviará preenchido, mas o backend
  // permanece compatível com payloads antigos (só IDs).
  //
  // ============================================================
  team: z.object({
    // ---- Campos originais (INALTERADOS) ----
    leadAuditor: z.string(),
    auditors: z.array(z.string()),
    observers: z.array(z.string()),
    specialists: z.array(z.string()).optional(),

    // ---- 🆕 v49.1 — Nomes e emails ----
    leadAuditorName: z.string().optional(),
    leadAuditorEmail: z
      .string()
      .email('Email do auditor líder inválido')
      .optional()
      .or(z.literal('')), // Permite string vazia (auditor manual sem email)

    auditorNames: z.array(z.string()).optional(),
    auditorEmails: z.array(z.string()).optional(),

    observerNames: z.array(z.string()).optional(),
    observerEmails: z.array(z.string()).optional(),
  }),

  period: z.object({
    startDate: z.string().transform((val) => new Date(val)),
    endDate: z.string().transform((val) => new Date(val)),
    estimatedDays: z.number().min(1, 'Dias estimados deve ser no mínimo 1'),
  }),

  criteria: z.array(z.string()).min(1, 'Pelo menos um critério é obrigatório'),
  observations: z.string().optional(),
});

export const updateAuditPlanSchema = createAuditPlanSchema.partial();

// ============================================================
// SCHEMAS — EXCLUSÃO DE CONTROLE (Opção C)
// ============================================================

/**
 * Excluir um controle do escopo do plano.
 *
 * Aplica-se apenas a planos em modo 'all'.
 * A justificativa deve ter no mínimo 20 caracteres (ISO 19011:2018).
 */
export const excludeControlSchema = z.object({
  controlId: z.string().min(1, 'ID do controle é obrigatório'),
  reason: z
    .string()
    .min(20, 'A justificativa deve ter no mínimo 20 caracteres')
    .max(1000, 'A justificativa não pode exceder 1000 caracteres'),
});

/**
 * Aprovar uma exclusão de controle.
 *
 * Apenas o Auditor Líder pode aprovar.
 */
export const approveExclusionSchema = z.object({
  controlId: z.string().min(1, 'ID do controle é obrigatório'),
});

/**
 * Rejeitar uma exclusão de controle.
 *
 * Apenas o Auditor Líder pode rejeitar.
 * Ao rejeitar, o controle volta ao escopo efetivo.
 */
export const rejectExclusionSchema = z.object({
  controlId: z.string().min(1, 'ID do controle é obrigatório'),
});

/**
 * Remover uma exclusão já registrada.
 *
 * Autor da exclusão OU Auditor Líder.
 * Ao remover, o controle volta ao escopo efetivo.
 */
export const removeExclusionSchema = z.object({
  controlId: z.string().min(1, 'ID do controle é obrigatório'),
});

// ============================================================
// CHECKLIST
// ============================================================

export const updateChecklistSchema = z.object({
  questions: z.array(
    z.object({
      question: z.string(),
      answer: z.enum(['C', 'NC', 'OB', 'OM', 'NA']),
      observations: z.string().optional(),
      evidenceIds: z.array(z.string()).optional(),
      responsible: z.string(),
      answeredAt: z.string().transform((val) => new Date(val)).optional(),
      answeredBy: z.string().optional(),
    })
  ),
});

// ============================================================
// NÃO CONFORMIDADE (FINDING)
// ============================================================

export const createAuditFindingSchema = z.object({
  auditPlanId: z.string(),
  checklistId: z.string().optional(),
  type: z.enum(['NC_A', 'NC_B', 'CM', 'OM', 'AP']),
  title: z.string().min(3, 'Título deve ter no mínimo 3 caracteres'),
  description: z.string().min(10, 'Descrição deve ter no mínimo 10 caracteres'),
  area: z.string(),
  process: z.string(),
  clause: z.string(),
  controlId: z.string().optional(),
  evidenceIds: z.array(z.string()).optional(),
  deadline: z.string().transform((val) => new Date(val)),
});

export const updateAuditFindingSchema = createAuditFindingSchema.partial();

// ============================================================
// PLANO DE AÇÃO
// ============================================================

export const createAuditActionPlanSchema = z.object({
  findingId: z.string(),
  auditPlanId: z.string(),
  companyId: z.string(),
  action: z.string().min(3, 'Ação deve ter no mínimo 3 caracteres'),
  description: z.string().optional(),
  responsible: z.string(),
  deadline: z.string().transform((val) => new Date(val)),
  evidenceIds: z.array(z.string()).optional(),
});

export const updateAuditActionPlanSchema = createAuditActionPlanSchema.partial();

// ============================================================
// RELATÓRIO DE AUDITORIA
// ============================================================

export const createAuditReportSchema = z.object({
  auditPlanId: z.string(),
  companyId: z.string(),
  version: z.string().default('1.0'),
  organization: z.object({
    legalName: z.string(),
    corporateGroup: z.string().optional(),
    address: z.string(),
    country: z.string(),
    contact: z.string(),
    email: z.string().email('Email inválido'),
    phone: z.string(),
    language: z.string(),
    scope: z.string(),
    industry: z.string(),
  }),
  profile: z.object({
    standards: z.array(z.string()),
    auditType: z.enum(['internal', 'external', 'supplier']),
    documentation: z.string(),
    frequency: z.string(),
    leadAuditor: z.string(),
    auditTeam: z.array(z.string()),
    specialists: z.array(z.string()).optional(),
    trainees: z.array(z.string()).optional(),
    multiSite: z.boolean().default(false),
    sites: z.array(z.string()).optional(),
    operationalShifts: z.string(),
  }),
  details: z.object({
    auditedLocations: z.array(z.string()),
    auditDate: z.string().transform((val) => new Date(val)),
    auditEndDate: z.string().transform((val) => new Date(val)),
    workDays: z.number().min(0),
  }),
  summary: z.string().min(10, 'Resumo deve ter no mínimo 10 caracteres'),
  conclusion: z.string().min(10, 'Conclusão deve ter no mínimo 10 caracteres'),
  followUp: z.object({
    required: z.enum(['none', 'reaudit', 'next_audit']).default('none'),
    details: z.string().optional(),
  }),
  attachments: z.array(
    z.object({
      name: z.string(),
      type: z.enum(['checklist', 'questionnaire', 'evidence', 'other']),
      url: z.string(),
    })
  ).optional(),
});

export const updateAuditReportSchema = createAuditReportSchema.partial();

// ============================================================
// EVIDÊNCIA
// ============================================================

export const uploadEvidenceSchema = z.object({
  auditPlanId: z.string(),
  findingId: z.string().optional(),
  description: z.string().optional(),
});

// ============================================================
// PROGRAMA DE AUDITORIAS
// ============================================================

export const createAuditProgramSchema = z.object({
  companyId: z.string(),
  year: z.number().min(2000).max(2100),
  sectors: z.array(
    z.object({
      name: z.string().min(1, 'Nome do setor é obrigatório'),
      processes: z.array(z.string()).default([]),
      importance: z.enum(['critical', 'standard']).default('standard'),
      scoreA: z.number().min(0).max(2).default(0),
      scoreB: z.number().min(0).max(1).default(0),
      frequency: z.enum(['annual', 'semiannual', 'quarterly']).default('annual'),
      nextAuditDate: z.string().transform((val) => new Date(val)).optional(),
    })
  ).default([]),
  supplierAudits: z.array(
    z.object({
      supplierName: z.string().min(1, 'Nome do fornecedor é obrigatório'),
      supplierId: z.string().optional(),
      auditDate: z.string().transform((val) => new Date(val)),
      scope: z.string().min(1, 'Escopo é obrigatório'),
    })
  ).default([]),
  externalAudit: z.object({
    plannedDate: z.string().transform((val) => new Date(val)).optional(),
    certificationBody: z.string().optional(),
    scope: z.string().optional(),
    status: z.enum(['not_planned', 'scheduled', 'in_progress', 'completed', 'cancelled']).default('not_planned'),
  }).default({ status: 'not_planned' }),
  otherActivities: z.array(
    z.object({
      name: z.string().min(1, 'Nome da atividade é obrigatório'),
      description: z.string().optional(),
      scheduledDate: z.string().transform((val) => new Date(val)),
    })
  ).default([]),
  observations: z.string().optional(),
});

export const updateAuditProgramSchema = createAuditProgramSchema.partial();

export const addSectorSchema = z.object({
  name: z.string().min(1, 'Nome do setor é obrigatório'),
  processes: z.array(z.string()).optional(),
  importance: z.enum(['critical', 'standard']).optional(),
  scoreA: z.number().min(0).max(2).optional(),
  scoreB: z.number().min(0).max(1).optional(),
  frequency: z.enum(['annual', 'semiannual', 'quarterly']).optional(),
  nextAuditDate: z.string().transform((val) => new Date(val)).optional(),
});

export const addSupplierAuditSchema = z.object({
  supplierName: z.string().min(1, 'Nome do fornecedor é obrigatório'),
  supplierId: z.string().optional(),
  auditDate: z.string().transform((val) => new Date(val)),
  scope: z.string().min(1, 'Escopo é obrigatório'),
});

export const addActivitySchema = z.object({
  name: z.string().min(1, 'Nome da atividade é obrigatório'),
  description: z.string().optional(),
  scheduledDate: z.string().transform((val) => new Date(val)),
});

// ============================================================
// DECLARAÇÃO DE APLICABILIDADE (SoA)
// ============================================================

export const createAuditSoASchema = z.object({
  companyId: z.string(),
  version: z.string().default('1.0'),
  controls: z.array(
    z.object({
      clause: z.string().min(1, 'Cláusula é obrigatória'),
      title: z.string().min(1, 'Título é obrigatório'),
      objective: z.string().min(1, 'Objetivo é obrigatório'),
      motivators: z.object({
        business: z.boolean().default(false),
        risk: z.boolean().default(false),
        legal: z.boolean().default(false),
        contract: z.boolean().default(false),
      }).default({ business: false, risk: false, legal: false, contract: false }),
      applicable: z.boolean().default(true),
      justification: z.string().optional(),
      lastAssessmentDate: z.string().transform((val) => new Date(val)).optional(),
      implemented: z.boolean().default(false),
      implementationDate: z.string().transform((val) => new Date(val)).optional(),
      responsible: z.string().optional(),
      evidence: z.string().optional(),
    })
  ).optional(),
  observations: z.string().optional(),
});

export const updateAuditSoASchema = createAuditSoASchema.partial();

export const updateSoAControlSchema = z.object({
  title: z.string().optional(),
  objective: z.string().optional(),
  motivators: z.object({
    business: z.boolean().optional(),
    risk: z.boolean().optional(),
    legal: z.boolean().optional(),
    contract: z.boolean().optional(),
  }).optional(),
  applicable: z.boolean().optional(),
  justification: z.string().optional(),
  lastAssessmentDate: z.string().transform((val) => new Date(val)).optional(),
  implemented: z.boolean().optional(),
  implementationDate: z.string().transform((val) => new Date(val)).optional(),
  responsible: z.string().optional(),
  evidence: z.string().optional(),
});

// ============================================================
// GESTÃO DE RISCOS
// ============================================================

export const createAuditRiskSchema = z.object({
  companyId: z.string(),
  auditPlanId: z.string().optional(),
  description: z.string().min(3, 'Descrição deve ter no mínimo 3 caracteres'),
  eventOrAsset: z.string().min(1, 'Evento ou ativo é obrigatório'),
  owner: z.string().min(1, 'Proprietário é obrigatório'),
  threat: z.string().min(1, 'Ameaça é obrigatória'),
  vulnerability: z.string().min(1, 'Vulnerabilidade é obrigatória'),
  existingControl: z.string().min(1, 'Controle existente é obrigatório'),
  probability: z.number().min(1).max(5),
  impact: z.number().min(1).max(5),
  riskClassification: z.string().min(1, 'Classificação do risco é obrigatória'),
  treatment: z.enum(['accept', 'mitigate', 'transfer', 'avoid']).default('mitigate'),
  treatmentPlan: z.string().optional(),
  probabilityAfter: z.number().min(1).max(5).optional(),
  impactAfter: z.number().min(1).max(5).optional(),
  treatmentDeadline: z.string().transform((val) => new Date(val)).optional(),
  status: z.enum(['identified', 'analyzed', 'treated', 'monitored', 'closed']).default('identified'),
});

export const updateAuditRiskSchema = createAuditRiskSchema.partial();

export const updateRiskAssessmentSchema = z.object({
  probability: z.number().min(1).max(5),
  impact: z.number().min(1).max(5),
});

export const treatRiskSchema = z.object({
  treatment: z.enum(['accept', 'mitigate', 'transfer', 'avoid']),
  treatmentPlan: z.string().min(1, 'Plano de tratamento é obrigatório'),
  probabilityAfter: z.number().min(1).max(5),
  impactAfter: z.number().min(1).max(5),
  treatmentDeadline: z.string().transform((val) => new Date(val)).optional(),
});

export const monitorRiskSchema = z.object({
  status: z.enum(['monitored', 'closed']),
});

export const reopenRiskSchema = z.object({
  reason: z.string().min(1, 'Motivo da reabertura é obrigatório'),
});

// ============================================================
// REVISÃO DE DOCUMENTAÇÃO
// ============================================================

export const createAuditDocumentReviewSchema = z.object({
  companyId: z.string(),
  auditPlanId: z.string(),
  documents: z.array(
    z.object({
      clause: z.string().min(1, 'Cláusula é obrigatória'),
      requirement: z.string().min(1, 'Requisito é obrigatório'),
      status: z.enum(['OK', 'NC_A', 'NC_B', 'PI', 'GP', 'CM', '--']).default('--'),
      observations: z.string().optional(),
      reviewer: z.string().min(1, 'Revisor é obrigatório'),
      reviewDate: z.string().transform((val) => new Date(val)),
      documentId: z.string().optional(),
      documentName: z.string().optional(),
    })
  ).optional(),
  observations: z.string().optional(),
});

export const updateAuditDocumentReviewSchema = createAuditDocumentReviewSchema.partial();

export const updateDocumentStatusSchema = z.object({
  status: z.enum(['OK', 'NC_A', 'NC_B', 'PI', 'GP', 'CM', '--']),
  observations: z.string().optional(),
});

export const addDocumentReviewSchema = z.object({
  clause: z.string().min(1, 'Cláusula é obrigatória'),
  requirement: z.string().min(1, 'Requisito é obrigatório'),
  status: z.enum(['OK', 'NC_A', 'NC_B', 'PI', 'GP', 'CM', '--']).default('--'),
  observations: z.string().optional(),
  reviewer: z.string().min(1, 'Revisor é obrigatório'),
  reviewDate: z.string().transform((val) => new Date(val)).optional(),
  documentId: z.string().optional(),
  documentName: z.string().optional(),
});

// ============================================================
// EXPORTAÇÃO DE TODOS OS SCHEMAS
// ============================================================

export default {
  // Existentes
  createAuditPlanSchema,
  updateAuditPlanSchema,
  updateChecklistSchema,
  createAuditFindingSchema,
  updateAuditFindingSchema,
  createAuditActionPlanSchema,
  updateAuditActionPlanSchema,
  createAuditReportSchema,
  updateAuditReportSchema,
  uploadEvidenceSchema,

  // Exclusão de Controle
  excludeControlSchema,
  approveExclusionSchema,
  rejectExclusionSchema,
  removeExclusionSchema,

  // Programa
  createAuditProgramSchema,
  updateAuditProgramSchema,
  addSectorSchema,
  addSupplierAuditSchema,
  addActivitySchema,

  // SoA
  createAuditSoASchema,
  updateAuditSoASchema,
  updateSoAControlSchema,

  // Riscos
  createAuditRiskSchema,
  updateAuditRiskSchema,
  updateRiskAssessmentSchema,
  treatRiskSchema,
  monitorRiskSchema,
  reopenRiskSchema,

  // Document Review
  createAuditDocumentReviewSchema,
  updateAuditDocumentReviewSchema,
  updateDocumentStatusSchema,
  addDocumentReviewSchema,
};