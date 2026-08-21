"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addDocumentReviewSchema = exports.updateDocumentStatusSchema = exports.updateAuditDocumentReviewSchema = exports.createAuditDocumentReviewSchema = exports.reopenRiskSchema = exports.monitorRiskSchema = exports.treatRiskSchema = exports.updateRiskAssessmentSchema = exports.updateAuditRiskSchema = exports.createAuditRiskSchema = exports.updateSoAControlSchema = exports.updateAuditSoASchema = exports.createAuditSoASchema = exports.addActivitySchema = exports.addSupplierAuditSchema = exports.addSectorSchema = exports.updateAuditProgramSchema = exports.createAuditProgramSchema = exports.uploadEvidenceSchema = exports.updateAuditReportSchema = exports.createAuditReportSchema = exports.updateAuditActionPlanSchema = exports.createAuditActionPlanSchema = exports.updateAuditFindingSchema = exports.createAuditFindingSchema = exports.updateChecklistSchema = exports.updateAuditPlanSchema = exports.createAuditPlanSchema = void 0;
const zod_1 = require("zod");
// ============================================================
// SCHEMAS EXISTENTES (MANTER)
// ============================================================
exports.createAuditPlanSchema = zod_1.z.object({
    title: zod_1.z.string().min(3, 'Título deve ter no mínimo 3 caracteres'),
    description: zod_1.z.string().min(10, 'Descrição deve ter no mínimo 10 caracteres'),
    companyId: zod_1.z.string(),
    programId: zod_1.z.string().optional(),
    scope: zod_1.z.object({
        controls: zod_1.z.array(zod_1.z.string()),
        processes: zod_1.z.array(zod_1.z.string()),
        areas: zod_1.z.array(zod_1.z.string()),
    }),
    team: zod_1.z.object({
        leadAuditor: zod_1.z.string(),
        auditors: zod_1.z.array(zod_1.z.string()),
        observers: zod_1.z.array(zod_1.z.string()),
        specialists: zod_1.z.array(zod_1.z.string()).optional(),
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
exports.uploadEvidenceSchema = zod_1.z.object({
    auditPlanId: zod_1.z.string(),
    findingId: zod_1.z.string().optional(),
    description: zod_1.z.string().optional(),
});
// ============================================================
// 🆕 SCHEMAS - PROGRAMA DE AUDITORIAS
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
// 🆕 SCHEMAS - DECLARAÇÃO DE APLICABILIDADE (SoA)
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
// 🆕 SCHEMAS - GESTÃO DE RISCOS
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
// 🆕 SCHEMAS - REVISÃO DE DOCUMENTAÇÃO
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
    // Novos - Programa
    createAuditProgramSchema: exports.createAuditProgramSchema,
    updateAuditProgramSchema: exports.updateAuditProgramSchema,
    addSectorSchema: exports.addSectorSchema,
    addSupplierAuditSchema: exports.addSupplierAuditSchema,
    addActivitySchema: exports.addActivitySchema,
    // Novos - SoA
    createAuditSoASchema: exports.createAuditSoASchema,
    updateAuditSoASchema: exports.updateAuditSoASchema,
    updateSoAControlSchema: exports.updateSoAControlSchema,
    // Novos - Riscos
    createAuditRiskSchema: exports.createAuditRiskSchema,
    updateAuditRiskSchema: exports.updateAuditRiskSchema,
    updateRiskAssessmentSchema: exports.updateRiskAssessmentSchema,
    treatRiskSchema: exports.treatRiskSchema,
    monitorRiskSchema: exports.monitorRiskSchema,
    reopenRiskSchema: exports.reopenRiskSchema,
    // Novos - Document Review
    createAuditDocumentReviewSchema: exports.createAuditDocumentReviewSchema,
    updateAuditDocumentReviewSchema: exports.updateAuditDocumentReviewSchema,
    updateDocumentStatusSchema: exports.updateDocumentStatusSchema,
    addDocumentReviewSchema: exports.addDocumentReviewSchema,
};
//# sourceMappingURL=audit.schemas.js.map