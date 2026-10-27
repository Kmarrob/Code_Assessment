"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAuditQuestionSchema = exports.auditQuestionFiltersSchema = exports.updateAuditQuestionSchema = exports.createAuditQuestionSchema = exports.addDocumentReviewSchema = exports.updateDocumentStatusSchema = exports.updateAuditDocumentReviewSchema = exports.createAuditDocumentReviewSchema = exports.reopenRiskSchema = exports.monitorRiskSchema = exports.treatRiskSchema = exports.updateRiskAssessmentSchema = exports.updateAuditRiskSchema = exports.createAuditRiskSchema = exports.updateSoAControlSchema = exports.updateAuditSoASchema = exports.createAuditSoASchema = exports.addActivitySchema = exports.addSupplierAuditSchema = exports.addSectorSchema = exports.updateAuditProgramSchema = exports.createAuditProgramSchema = exports.uploadEvidenceSchema = exports.updateAuditReportSchema = exports.createAuditReportSchema = exports.updateAuditActionPlanSchema = exports.createAuditActionPlanSchema = exports.updateAuditFindingSchema = exports.createAuditFindingSchema = exports.updateChecklistSchema = exports.removeExclusionSchema = exports.rejectExclusionSchema = exports.approveExclusionSchema = exports.excludeControlSchema = exports.updateAuditPlanSchema = exports.createAuditPlanSchema = void 0;
const zod_1 = require("zod");
// ============================================================
// SCHEMAS EXISTENTES (MANTER)
// ============================================================
/**
 * Schema para criação de um controle excluído do escopo.
 *
 * Usado no createAuditPlanSchema para aceitar exclusões
 * enviadas junto com o payload do plano.
 */
const excludedControlPayloadSchema = zod_1.z.object({
    controlId: zod_1.z.string().min(1, 'ID do controle é obrigatório'),
    reason: zod_1.z
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
exports.createAuditPlanSchema = zod_1.z.object({
    title: zod_1.z.string().min(3, 'Título deve ter no mínimo 3 caracteres'),
    description: zod_1.z.string().min(10, 'Descrição deve ter no mínimo 10 caracteres'),
    companyId: zod_1.z.string(),
    programId: zod_1.z.string().optional(),
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
    scope: zod_1.z
        .object({
        mode: zod_1.z.enum(['all', 'custom']).optional().default('all'),
        controls: zod_1.z.array(zod_1.z.string()).optional().default([]),
        /**
         * Exclusões enviadas junto com o payload.
         * O service processa cada uma para gerar IAuditExcludedControl
         * com excludedBy e excludedAt preenchidos.
         */
        excludedControls: zod_1.z
            .array(excludedControlPayloadSchema)
            .optional()
            .default([]),
        processes: zod_1.z.array(zod_1.z.string()),
        areas: zod_1.z.array(zod_1.z.string()),
    })
        .refine((data) => {
        // Em modo 'custom', pelo menos 1 controle é obrigatório
        if (data.mode === 'custom') {
            return data.controls && data.controls.length > 0;
        }
        return true;
    }, {
        message: 'Modo "custom" requer pelo menos 1 controle em scope.controls',
        path: ['controls'],
    }),
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
    team: zod_1.z.object({
        // ---- Campos originais (INALTERADOS) ----
        leadAuditor: zod_1.z.string(),
        auditors: zod_1.z.array(zod_1.z.string()),
        observers: zod_1.z.array(zod_1.z.string()),
        specialists: zod_1.z.array(zod_1.z.string()).optional(),
        // ---- 🆕 v49.1 — Nomes e emails ----
        leadAuditorName: zod_1.z.string().optional(),
        leadAuditorEmail: zod_1.z
            .string()
            .email('Email do auditor líder inválido')
            .optional()
            .or(zod_1.z.literal('')), // Permite string vazia (auditor manual sem email)
        auditorNames: zod_1.z.array(zod_1.z.string()).optional(),
        auditorEmails: zod_1.z.array(zod_1.z.string()).optional(),
        observerNames: zod_1.z.array(zod_1.z.string()).optional(),
        observerEmails: zod_1.z.array(zod_1.z.string()).optional(),
    }),
    period: zod_1.z.object({
        startDate: zod_1.z.string().transform((val) => new Date(val)),
        endDate: zod_1.z.string().transform((val) => new Date(val)),
        estimatedDays: zod_1.z.number().min(1, 'Dias estimados deve ser no mínimo 1'),
    }),
    criteria: zod_1.z.array(zod_1.z.string()).min(1, 'Pelo menos um critério é obrigatório'),
    observations: zod_1.z.string().optional(),
});
exports.updateAuditPlanSchema = exports.createAuditPlanSchema.partial();
// ============================================================
// SCHEMAS — EXCLUSÃO DE CONTROLE (Opção C)
// ============================================================
/**
 * Excluir um controle do escopo do plano.
 *
 * Aplica-se apenas a planos em modo 'all'.
 * A justificativa deve ter no mínimo 20 caracteres (ISO 19011:2018).
 */
exports.excludeControlSchema = zod_1.z.object({
    controlId: zod_1.z.string().min(1, 'ID do controle é obrigatório'),
    reason: zod_1.z
        .string()
        .min(20, 'A justificativa deve ter no mínimo 20 caracteres')
        .max(1000, 'A justificativa não pode exceder 1000 caracteres'),
});
/**
 * Aprovar uma exclusão de controle.
 *
 * Apenas o Auditor Líder pode aprovar.
 */
exports.approveExclusionSchema = zod_1.z.object({
    controlId: zod_1.z.string().min(1, 'ID do controle é obrigatório'),
});
/**
 * Rejeitar uma exclusão de controle.
 *
 * Apenas o Auditor Líder pode rejeitar.
 * Ao rejeitar, o controle volta ao escopo efetivo.
 */
exports.rejectExclusionSchema = zod_1.z.object({
    controlId: zod_1.z.string().min(1, 'ID do controle é obrigatório'),
});
/**
 * Remover uma exclusão já registrada.
 *
 * Autor da exclusão OU Auditor Líder.
 * Ao remover, o controle volta ao escopo efetivo.
 */
exports.removeExclusionSchema = zod_1.z.object({
    controlId: zod_1.z.string().min(1, 'ID do controle é obrigatório'),
});
// ============================================================
// CHECKLIST
// ============================================================
exports.updateChecklistSchema = zod_1.z.object({
    questions: zod_1.z.array(zod_1.z.object({
        question: zod_1.z.string(),
        answer: zod_1.z.enum(['C', 'NC', 'OB', 'OM', 'NA']),
        observations: zod_1.z.string().optional(),
        evidenceIds: zod_1.z.array(zod_1.z.string()).optional(),
        responsible: zod_1.z.string(),
        answeredAt: zod_1.z.string().transform((val) => new Date(val)).optional(),
        answeredBy: zod_1.z.string().optional(),
    })),
});
// ============================================================
// NÃO CONFORMIDADE (FINDING)
// ============================================================
exports.createAuditFindingSchema = zod_1.z.object({
    auditPlanId: zod_1.z.string(),
    checklistId: zod_1.z.string().optional(),
    type: zod_1.z.enum(['NC_A', 'NC_B', 'CM', 'OM', 'AP']),
    title: zod_1.z.string().min(3, 'Título deve ter no mínimo 3 caracteres'),
    description: zod_1.z.string().min(10, 'Descrição deve ter no mínimo 10 caracteres'),
    area: zod_1.z.string(),
    process: zod_1.z.string(),
    clause: zod_1.z.string(),
    controlId: zod_1.z.string().optional(),
    evidenceIds: zod_1.z.array(zod_1.z.string()).optional(),
    deadline: zod_1.z.string().transform((val) => new Date(val)),
});
exports.updateAuditFindingSchema = exports.createAuditFindingSchema.partial();
// ============================================================
// PLANO DE AÇÃO
// ============================================================
exports.createAuditActionPlanSchema = zod_1.z.object({
    findingId: zod_1.z.string(),
    auditPlanId: zod_1.z.string(),
    companyId: zod_1.z.string(),
    action: zod_1.z.string().min(3, 'Ação deve ter no mínimo 3 caracteres'),
    description: zod_1.z.string().optional(),
    responsible: zod_1.z.string(),
    deadline: zod_1.z.string().transform((val) => new Date(val)),
    evidenceIds: zod_1.z.array(zod_1.z.string()).optional(),
});
exports.updateAuditActionPlanSchema = exports.createAuditActionPlanSchema.partial();
// ============================================================
// RELATÓRIO DE AUDITORIA
// ============================================================
exports.createAuditReportSchema = zod_1.z.object({
    auditPlanId: zod_1.z.string(),
    companyId: zod_1.z.string(),
    version: zod_1.z.string().default('1.0'),
    organization: zod_1.z.object({
        legalName: zod_1.z.string(),
        corporateGroup: zod_1.z.string().optional(),
        address: zod_1.z.string(),
        country: zod_1.z.string(),
        contact: zod_1.z.string(),
        email: zod_1.z.string().email('Email inválido'),
        phone: zod_1.z.string(),
        language: zod_1.z.string(),
        scope: zod_1.z.string(),
        industry: zod_1.z.string(),
    }),
    profile: zod_1.z.object({
        standards: zod_1.z.array(zod_1.z.string()),
        auditType: zod_1.z.enum(['internal', 'external', 'supplier']),
        documentation: zod_1.z.string(),
        frequency: zod_1.z.string(),
        leadAuditor: zod_1.z.string(),
        auditTeam: zod_1.z.array(zod_1.z.string()),
        specialists: zod_1.z.array(zod_1.z.string()).optional(),
        trainees: zod_1.z.array(zod_1.z.string()).optional(),
        multiSite: zod_1.z.boolean().default(false),
        sites: zod_1.z.array(zod_1.z.string()).optional(),
        operationalShifts: zod_1.z.string(),
    }),
    details: zod_1.z.object({
        auditedLocations: zod_1.z.array(zod_1.z.string()),
        auditDate: zod_1.z.string().transform((val) => new Date(val)),
        auditEndDate: zod_1.z.string().transform((val) => new Date(val)),
        workDays: zod_1.z.number().min(0),
    }),
    summary: zod_1.z.string().min(10, 'Resumo deve ter no mínimo 10 caracteres'),
    conclusion: zod_1.z.string().min(10, 'Conclusão deve ter no mínimo 10 caracteres'),
    followUp: zod_1.z.object({
        required: zod_1.z.enum(['none', 'reaudit', 'next_audit']).default('none'),
        details: zod_1.z.string().optional(),
    }),
    attachments: zod_1.z.array(zod_1.z.object({
        name: zod_1.z.string(),
        type: zod_1.z.enum(['checklist', 'questionnaire', 'evidence', 'other']),
        url: zod_1.z.string(),
    })).optional(),
});
exports.updateAuditReportSchema = exports.createAuditReportSchema.partial();
// ============================================================
// EVIDÊNCIA
// ============================================================
//
// 🆕 v51.1 — CAMPO `questionRef` (OPCIONAL)
// ------------------------------------------
// Aceita um objeto `{ controlId, questionIndex? }` que vincula
// a evidência a uma pergunta específica do checklist.
//
// - `questionIndex` presente → pergunta de auditoria.
// - `questionIndex` ausente  → constatação final do controle.
//
// Se `questionRef` NÃO for enviado, a evidência fica apenas
// vinculada ao plano (comportamento antigo, compatível).
//
// ============================================================
exports.uploadEvidenceSchema = zod_1.z.object({
    auditPlanId: zod_1.z.string(),
    findingId: zod_1.z.string().optional(),
    description: zod_1.z.string().optional(),
    // 🆕 v51.1 — Vínculo opcional com pergunta do checklist
    questionRef: zod_1.z
        .object({
        controlId: zod_1.z.string().min(1, 'ID do controle é obrigatório'),
        // AUSENTE = constatação final; presente = pergunta de auditoria
        questionIndex: zod_1.z.number().int().min(0).optional(),
    })
        .optional(),
});
// ============================================================
// PROGRAMA DE AUDITORIAS
// ============================================================
exports.createAuditProgramSchema = zod_1.z.object({
    companyId: zod_1.z.string(),
    year: zod_1.z.number().min(2000).max(2100),
    sectors: zod_1.z.array(zod_1.z.object({
        name: zod_1.z.string().min(1, 'Nome do setor é obrigatório'),
        processes: zod_1.z.array(zod_1.z.string()).default([]),
        importance: zod_1.z.enum(['critical', 'standard']).default('standard'),
        scoreA: zod_1.z.number().min(0).max(2).default(0),
        scoreB: zod_1.z.number().min(0).max(1).default(0),
        frequency: zod_1.z.enum(['annual', 'semiannual', 'quarterly']).default('annual'),
        nextAuditDate: zod_1.z.string().transform((val) => new Date(val)).optional(),
    })).default([]),
    supplierAudits: zod_1.z.array(zod_1.z.object({
        supplierName: zod_1.z.string().min(1, 'Nome do fornecedor é obrigatório'),
        supplierId: zod_1.z.string().optional(),
        auditDate: zod_1.z.string().transform((val) => new Date(val)),
        scope: zod_1.z.string().min(1, 'Escopo é obrigatório'),
    })).default([]),
    externalAudit: zod_1.z.object({
        plannedDate: zod_1.z.string().transform((val) => new Date(val)).optional(),
        certificationBody: zod_1.z.string().optional(),
        scope: zod_1.z.string().optional(),
        status: zod_1.z.enum(['not_planned', 'scheduled', 'in_progress', 'completed', 'cancelled']).default('not_planned'),
    }).default({ status: 'not_planned' }),
    otherActivities: zod_1.z.array(zod_1.z.object({
        name: zod_1.z.string().min(1, 'Nome da atividade é obrigatório'),
        description: zod_1.z.string().optional(),
        scheduledDate: zod_1.z.string().transform((val) => new Date(val)),
    })).default([]),
    observations: zod_1.z.string().optional(),
});
exports.updateAuditProgramSchema = exports.createAuditProgramSchema.partial();
exports.addSectorSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Nome do setor é obrigatório'),
    processes: zod_1.z.array(zod_1.z.string()).optional(),
    importance: zod_1.z.enum(['critical', 'standard']).optional(),
    scoreA: zod_1.z.number().min(0).max(2).optional(),
    scoreB: zod_1.z.number().min(0).max(1).optional(),
    frequency: zod_1.z.enum(['annual', 'semiannual', 'quarterly']).optional(),
    nextAuditDate: zod_1.z.string().transform((val) => new Date(val)).optional(),
});
exports.addSupplierAuditSchema = zod_1.z.object({
    supplierName: zod_1.z.string().min(1, 'Nome do fornecedor é obrigatório'),
    supplierId: zod_1.z.string().optional(),
    auditDate: zod_1.z.string().transform((val) => new Date(val)),
    scope: zod_1.z.string().min(1, 'Escopo é obrigatório'),
});
exports.addActivitySchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Nome da atividade é obrigatório'),
    description: zod_1.z.string().optional(),
    scheduledDate: zod_1.z.string().transform((val) => new Date(val)),
});
// ============================================================
// DECLARAÇÃO DE APLICABILIDADE (SoA)
// ============================================================
exports.createAuditSoASchema = zod_1.z.object({
    companyId: zod_1.z.string(),
    version: zod_1.z.string().default('1.0'),
    controls: zod_1.z.array(zod_1.z.object({
        clause: zod_1.z.string().min(1, 'Cláusula é obrigatória'),
        title: zod_1.z.string().min(1, 'Título é obrigatório'),
        objective: zod_1.z.string().min(1, 'Objetivo é obrigatório'),
        motivators: zod_1.z.object({
            business: zod_1.z.boolean().default(false),
            risk: zod_1.z.boolean().default(false),
            legal: zod_1.z.boolean().default(false),
            contract: zod_1.z.boolean().default(false),
        }).default({ business: false, risk: false, legal: false, contract: false }),
        applicable: zod_1.z.boolean().default(true),
        justification: zod_1.z.string().optional(),
        lastAssessmentDate: zod_1.z.string().transform((val) => new Date(val)).optional(),
        implemented: zod_1.z.boolean().default(false),
        implementationDate: zod_1.z.string().transform((val) => new Date(val)).optional(),
        responsible: zod_1.z.string().optional(),
        evidence: zod_1.z.string().optional(),
    })).optional(),
    observations: zod_1.z.string().optional(),
});
exports.updateAuditSoASchema = exports.createAuditSoASchema.partial();
exports.updateSoAControlSchema = zod_1.z.object({
    title: zod_1.z.string().optional(),
    objective: zod_1.z.string().optional(),
    motivators: zod_1.z.object({
        business: zod_1.z.boolean().optional(),
        risk: zod_1.z.boolean().optional(),
        legal: zod_1.z.boolean().optional(),
        contract: zod_1.z.boolean().optional(),
    }).optional(),
    applicable: zod_1.z.boolean().optional(),
    justification: zod_1.z.string().optional(),
    lastAssessmentDate: zod_1.z.string().transform((val) => new Date(val)).optional(),
    implemented: zod_1.z.boolean().optional(),
    implementationDate: zod_1.z.string().transform((val) => new Date(val)).optional(),
    responsible: zod_1.z.string().optional(),
    evidence: zod_1.z.string().optional(),
});
// ============================================================
// GESTÃO DE RISCOS
// ============================================================
exports.createAuditRiskSchema = zod_1.z.object({
    companyId: zod_1.z.string(),
    auditPlanId: zod_1.z.string().optional(),
    description: zod_1.z.string().min(3, 'Descrição deve ter no mínimo 3 caracteres'),
    eventOrAsset: zod_1.z.string().min(1, 'Evento ou ativo é obrigatório'),
    owner: zod_1.z.string().min(1, 'Proprietário é obrigatório'),
    threat: zod_1.z.string().min(1, 'Ameaça é obrigatória'),
    vulnerability: zod_1.z.string().min(1, 'Vulnerabilidade é obrigatória'),
    existingControl: zod_1.z.string().min(1, 'Controle existente é obrigatório'),
    probability: zod_1.z.number().min(1).max(5),
    impact: zod_1.z.number().min(1).max(5),
    riskClassification: zod_1.z.string().min(1, 'Classificação do risco é obrigatória'),
    treatment: zod_1.z.enum(['accept', 'mitigate', 'transfer', 'avoid']).default('mitigate'),
    treatmentPlan: zod_1.z.string().optional(),
    probabilityAfter: zod_1.z.number().min(1).max(5).optional(),
    impactAfter: zod_1.z.number().min(1).max(5).optional(),
    treatmentDeadline: zod_1.z.string().transform((val) => new Date(val)).optional(),
    status: zod_1.z.enum(['identified', 'analyzed', 'treated', 'monitored', 'closed']).default('identified'),
});
exports.updateAuditRiskSchema = exports.createAuditRiskSchema.partial();
exports.updateRiskAssessmentSchema = zod_1.z.object({
    probability: zod_1.z.number().min(1).max(5),
    impact: zod_1.z.number().min(1).max(5),
});
exports.treatRiskSchema = zod_1.z.object({
    treatment: zod_1.z.enum(['accept', 'mitigate', 'transfer', 'avoid']),
    treatmentPlan: zod_1.z.string().min(1, 'Plano de tratamento é obrigatório'),
    probabilityAfter: zod_1.z.number().min(1).max(5),
    impactAfter: zod_1.z.number().min(1).max(5),
    treatmentDeadline: zod_1.z.string().transform((val) => new Date(val)).optional(),
});
exports.monitorRiskSchema = zod_1.z.object({
    status: zod_1.z.enum(['monitored', 'closed']),
});
exports.reopenRiskSchema = zod_1.z.object({
    reason: zod_1.z.string().min(1, 'Motivo da reabertura é obrigatório'),
});
// ============================================================
// REVISÃO DE DOCUMENTAÇÃO
// ============================================================
exports.createAuditDocumentReviewSchema = zod_1.z.object({
    companyId: zod_1.z.string(),
    auditPlanId: zod_1.z.string(),
    documents: zod_1.z.array(zod_1.z.object({
        clause: zod_1.z.string().min(1, 'Cláusula é obrigatória'),
        requirement: zod_1.z.string().min(1, 'Requisito é obrigatório'),
        status: zod_1.z.enum(['OK', 'NC_A', 'NC_B', 'PI', 'GP', 'CM', '--']).default('--'),
        observations: zod_1.z.string().optional(),
        reviewer: zod_1.z.string().min(1, 'Revisor é obrigatório'),
        reviewDate: zod_1.z.string().transform((val) => new Date(val)),
        documentId: zod_1.z.string().optional(),
        documentName: zod_1.z.string().optional(),
    })).optional(),
    observations: zod_1.z.string().optional(),
});
exports.updateAuditDocumentReviewSchema = exports.createAuditDocumentReviewSchema.partial();
exports.updateDocumentStatusSchema = zod_1.z.object({
    status: zod_1.z.enum(['OK', 'NC_A', 'NC_B', 'PI', 'GP', 'CM', '--']),
    observations: zod_1.z.string().optional(),
});
exports.addDocumentReviewSchema = zod_1.z.object({
    clause: zod_1.z.string().min(1, 'Cláusula é obrigatória'),
    requirement: zod_1.z.string().min(1, 'Requisito é obrigatório'),
    status: zod_1.z.enum(['OK', 'NC_A', 'NC_B', 'PI', 'GP', 'CM', '--']).default('--'),
    observations: zod_1.z.string().optional(),
    reviewer: zod_1.z.string().min(1, 'Revisor é obrigatório'),
    reviewDate: zod_1.z.string().transform((val) => new Date(val)).optional(),
    documentId: zod_1.z.string().optional(),
    documentName: zod_1.z.string().optional(),
});
// ============================================================
// 🆕 v49.2 — SCHEMAS DE PERGUNTAS DE AUDITORIA (CLÁUSULAS 4-10)
// ============================================================
//
// MOTIVO:
//   Validar a criação/edição de perguntas de auditoria de
//   cláusulas. Todos os schemas anteriores foram PRESERVADOS.
//
// ============================================================
/**
 * Schema para criação de pergunta de auditoria.
 */
exports.createAuditQuestionSchema = zod_1.z.object({
    clauseId: zod_1.z
        .string()
        .min(1, 'ID da cláusula é obrigatório')
        .max(20, 'ID da cláusula muito longo'),
    clauseTitle: zod_1.z.string().max(500).optional().default(''),
    clauseGroup: zod_1.z.string().max(500).optional().default(''),
    text: zod_1.z
        .string()
        .min(5, 'Texto da pergunta deve ter no mínimo 5 caracteres')
        .max(2000, 'Texto da pergunta muito longo'),
    objective: zod_1.z.string().max(2000).optional().default(''),
    guidance: zod_1.z.string().max(5000).optional().default(''),
    evidenceExpected: zod_1.z.string().max(2000).optional().default(''),
    conformityCriteria: zod_1.z.string().max(2000).optional().default(''),
    nonconformityCriteria: zod_1.z.string().max(2000).optional().default(''),
    criticality: zod_1.z
        .enum(['low', 'medium', 'high', 'critical'])
        .optional()
        .default('medium'),
    relatedControls: zod_1.z.array(zod_1.z.string()).optional().default([]),
    relatedDocuments: zod_1.z.array(zod_1.z.string()).optional().default([]),
    order: zod_1.z.number().min(1).optional().default(1),
    active: zod_1.z.boolean().optional().default(true),
});
/**
 * Schema para atualização de pergunta de auditoria.
 */
exports.updateAuditQuestionSchema = zod_1.z.object({
    clauseId: zod_1.z.string().min(1).max(20).optional(),
    clauseTitle: zod_1.z.string().max(500).optional(),
    clauseGroup: zod_1.z.string().max(500).optional(),
    text: zod_1.z
        .string()
        .min(5, 'Texto da pergunta deve ter no mínimo 5 caracteres')
        .max(2000)
        .optional(),
    objective: zod_1.z.string().max(2000).optional(),
    guidance: zod_1.z.string().max(5000).optional(),
    evidenceExpected: zod_1.z.string().max(2000).optional(),
    conformityCriteria: zod_1.z.string().max(2000).optional(),
    nonconformityCriteria: zod_1.z.string().max(2000).optional(),
    criticality: zod_1.z.enum(['low', 'medium', 'high', 'critical']).optional(),
    relatedControls: zod_1.z.array(zod_1.z.string()).optional(),
    relatedDocuments: zod_1.z.array(zod_1.z.string()).optional(),
    order: zod_1.z.number().min(1).optional(),
    active: zod_1.z.boolean().optional(),
});
/**
 * Schema para filtros de listagem (query params).
 * Todos opcionais.
 */
exports.auditQuestionFiltersSchema = zod_1.z.object({
    clauseId: zod_1.z.string().optional(),
    clauseGroup: zod_1.z.string().optional(),
    criticality: zod_1.z.enum(['low', 'medium', 'high', 'critical']).optional(),
    active: zod_1.z
        .union([zod_1.z.boolean(), zod_1.z.string().transform((v) => v === 'true')])
        .optional(),
    search: zod_1.z.string().optional(),
});
/**
 * Schema para exclusão de pergunta (by ID via params).
 */
exports.deleteAuditQuestionSchema = zod_1.z.object({
    id: zod_1.z.string().min(1, 'ID é obrigatório'),
});
// ============================================================
// EXPORTAÇÃO DE TODOS OS SCHEMAS
// ============================================================
exports.default = {
    // Existentes
    createAuditPlanSchema: exports.createAuditPlanSchema,
    updateAuditPlanSchema: exports.updateAuditPlanSchema,
    updateChecklistSchema: exports.updateChecklistSchema,
    createAuditFindingSchema: exports.createAuditFindingSchema,
    updateAuditFindingSchema: exports.updateAuditFindingSchema,
    createAuditActionPlanSchema: exports.createAuditActionPlanSchema,
    updateAuditActionPlanSchema: exports.updateAuditActionPlanSchema,
    createAuditReportSchema: exports.createAuditReportSchema,
    updateAuditReportSchema: exports.updateAuditReportSchema,
    uploadEvidenceSchema: exports.uploadEvidenceSchema,
    // Exclusão de Controle
    excludeControlSchema: exports.excludeControlSchema,
    approveExclusionSchema: exports.approveExclusionSchema,
    rejectExclusionSchema: exports.rejectExclusionSchema,
    removeExclusionSchema: exports.removeExclusionSchema,
    // Programa
    createAuditProgramSchema: exports.createAuditProgramSchema,
    updateAuditProgramSchema: exports.updateAuditProgramSchema,
    addSectorSchema: exports.addSectorSchema,
    addSupplierAuditSchema: exports.addSupplierAuditSchema,
    addActivitySchema: exports.addActivitySchema,
    // SoA
    createAuditSoASchema: exports.createAuditSoASchema,
    updateAuditSoASchema: exports.updateAuditSoASchema,
    updateSoAControlSchema: exports.updateSoAControlSchema,
    // Riscos
    createAuditRiskSchema: exports.createAuditRiskSchema,
    updateAuditRiskSchema: exports.updateAuditRiskSchema,
    updateRiskAssessmentSchema: exports.updateRiskAssessmentSchema,
    treatRiskSchema: exports.treatRiskSchema,
    monitorRiskSchema: exports.monitorRiskSchema,
    reopenRiskSchema: exports.reopenRiskSchema,
    // Document Review
    createAuditDocumentReviewSchema: exports.createAuditDocumentReviewSchema,
    updateAuditDocumentReviewSchema: exports.updateAuditDocumentReviewSchema,
    updateDocumentStatusSchema: exports.updateDocumentStatusSchema,
    addDocumentReviewSchema: exports.addDocumentReviewSchema,
    // 🆕 v49.2 — Perguntas de auditoria de cláusulas
    createAuditQuestionSchema: exports.createAuditQuestionSchema,
    updateAuditQuestionSchema: exports.updateAuditQuestionSchema,
    auditQuestionFiltersSchema: exports.auditQuestionFiltersSchema,
    deleteAuditQuestionSchema: exports.deleteAuditQuestionSchema,
};
//# sourceMappingURL=audit.schemas.js.map