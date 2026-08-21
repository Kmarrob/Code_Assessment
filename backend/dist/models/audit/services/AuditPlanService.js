"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditPlanService = void 0;
const AuditPlan_1 = require("../models/AuditPlan");
const AuditChecklist_1 = require("../models/AuditChecklist");
const Question_1 = require("../../Question");
const AuditChecklistService_1 = require("./AuditChecklistService");
/**
 * Mapeia documento do MongoDB para IAuditPlan com id
 */
function mapToIAuditPlan(doc) {
    if (!doc)
        return null;
    return {
        id: doc._id.toString(),
        ...doc,
    };
}
/**
 * Mapeia array de documentos para IAuditPlan[]
 */
function mapToIAuditPlanArray(docs) {
    if (!docs)
        return [];
    return docs.map(doc => mapToIAuditPlan(doc));
}
class AuditPlanService {
    checklistService;
    constructor() {
        this.checklistService = new AuditChecklistService_1.AuditChecklistService();
    }
    // ============================================================
    // CRIAR PLANO DE AUDITORIA
    // ============================================================
    async create(data, createdBy, companyId) {
        // Validar: leadAuditor não pode ser o mesmo que createdBy
        if (data.team.leadAuditor === createdBy) {
            throw new Error('O auditor líder não pode ser o mesmo que criou o plano');
        }
        const plan = new AuditPlan_1.AuditPlan({
            ...data,
            companyId,
            createdBy,
            status: 'draft',
        });
        await plan.save();
        // Gerar checklist automaticamente baseado nos controles selecionados
        if (data.scope.controls && data.scope.controls.length > 0) {
            await this.generateChecklist(plan._id.toString(), data.scope.controls, createdBy);
            // 🆕 POPULAR COM RESPOSTAS DOS USUÁRIOS
            // Após gerar os checklists, popula com as respostas existentes dos usuários
            try {
                const populatedCount = await this.checklistService.populateAllChecklists(plan._id.toString(), createdBy);
                console.log(`✅ ${populatedCount} checklists populados com respostas dos usuários`);
            }
            catch (populateError) {
                console.error('⚠️ Erro ao popular checklists com respostas dos usuários:', populateError);
                // Não interrompe o fluxo - o auditor pode popular manualmente depois
            }
        }
        return mapToIAuditPlan(plan.toObject());
    }
    // ============================================================
    // GERAR CHECKLIST AUTOMÁTICO
    // ============================================================
    async generateChecklist(planId, controlIds, createdBy) {
        for (const controlId of controlIds) {
            // As perguntas utilizadas na auditoria são as mesmas perguntas
            // cadastradas na biblioteca de perguntas do Code_Assessment.
            const sourceQuestions = await Question_1.Question.find({
                controlId,
                active: true,
            })
                .sort({ order: 1 })
                .lean();
            const questions = sourceQuestions.map((sourceQuestion) => ({
                question: sourceQuestion.text,
                answer: '--',
                observations: '',
                evidenceIds: [],
                responsible: createdBy,
            }));
            await AuditChecklist_1.AuditChecklist.create({
                auditPlanId: planId,
                controlId,
                questions,
                statistics: {
                    total: questions.length,
                    conforme: 0,
                    nonConforme: 0,
                    observacao: 0,
                    oportunidade: 0,
                    naoAplicavel: 0,
                },
                status: 'pending',
                createdBy,
            });
        }
    }
    // ============================================================
    // LISTAR PLANOS
    // ============================================================
    async findAll(filters) {
        const query = {};
        if (filters.companyId)
            query.companyId = filters.companyId;
        if (filters.status)
            query.status = filters.status;
        if (filters.leadAuditor) {
            query['team.leadAuditor'] = filters.leadAuditor;
        }
        if (filters.auditor) {
            query['team.auditors'] = { $in: [filters.auditor] };
        }
        if (filters.startDate || filters.endDate) {
            query['period.startDate'] = {};
            if (filters.startDate)
                query['period.startDate'].$gte = filters.startDate;
            if (filters.endDate)
                query['period.startDate'].$lte = filters.endDate;
        }
        if (filters.search) {
            query.$or = [
                { title: { $regex: filters.search, $options: 'i' } },
                { description: { $regex: filters.search, $options: 'i' } },
            ];
        }
        const docs = await AuditPlan_1.AuditPlan.find(query)
            .sort({ 'period.startDate': -1 })
            .lean();
        return mapToIAuditPlanArray(docs);
    }
    // ============================================================
    // BUSCAR PLANO POR ID
    // ============================================================
    async findById(id) {
        const doc = await AuditPlan_1.AuditPlan.findById(id).lean();
        if (!doc)
            return null;
        return mapToIAuditPlan(doc);
    }
    // ============================================================
    // ATUALIZAR PLANO
    // ============================================================
    async update(id, data, userId) {
        const plan = await AuditPlan_1.AuditPlan.findById(id);
        if (!plan)
            throw new Error('Plano não encontrado');
        if (plan.status !== 'draft' && plan.status !== 'pending_approval') {
            throw new Error('Apenas planos em rascunho ou aguardando aprovação podem ser editados');
        }
        Object.assign(plan, data);
        await plan.save();
        return mapToIAuditPlan(plan.toObject());
    }
    // ============================================================
    // ENVIAR PARA APROVAÇÃO
    // ============================================================
    async submitForApproval(id, userId) {
        const plan = await AuditPlan_1.AuditPlan.findById(id);
        if (!plan)
            throw new Error('Plano não encontrado');
        if (plan.createdBy !== userId) {
            throw new Error('Apenas o criador do plano pode enviar para aprovação');
        }
        if (plan.status !== 'draft') {
            throw new Error('Apenas planos em rascunho podem ser enviados para aprovação');
        }
        plan.status = 'pending_approval';
        await plan.save();
        return mapToIAuditPlan(plan.toObject());
    }
    // ============================================================
    // APROVAR PLANO
    // ============================================================
    async approve(id, approverId) {
        const plan = await AuditPlan_1.AuditPlan.findById(id);
        if (!plan)
            throw new Error('Plano não encontrado');
        if (plan.createdBy === approverId) {
            throw new Error('O aprovador não pode ser o mesmo que criou o plano');
        }
        if (plan.team.leadAuditor !== approverId) {
            throw new Error('Apenas o auditor líder designado pode aprovar o plano');
        }
        if (plan.status !== 'pending_approval') {
            throw new Error('Apenas planos aguardando aprovação podem ser aprovados');
        }
        plan.status = 'approved';
        plan.approvedBy = approverId;
        plan.approvedAt = new Date();
        await plan.save();
        return mapToIAuditPlan(plan.toObject());
    }
    // ============================================================
    // REJEITAR PLANO
    // ============================================================
    async reject(id, approverId, reason) {
        const plan = await AuditPlan_1.AuditPlan.findById(id);
        if (!plan)
            throw new Error('Plano não encontrado');
        if (plan.createdBy === approverId) {
            throw new Error('O rejeitador não pode ser o mesmo que criou o plano');
        }
        if (plan.team.leadAuditor !== approverId) {
            throw new Error('Apenas o auditor líder designado pode rejeitar o plano');
        }
        if (plan.status !== 'pending_approval') {
            throw new Error('Apenas planos aguardando aprovação podem ser rejeitados');
        }
        plan.status = 'draft';
        plan.approvedBy = approverId;
        plan.approvedAt = new Date();
        await plan.save();
        return mapToIAuditPlan(plan.toObject());
    }
    // ============================================================
    // CANCELAR PLANO
    // ============================================================
    async cancel(id, userId) {
        const plan = await AuditPlan_1.AuditPlan.findById(id);
        if (!plan)
            throw new Error('Plano não encontrado');
        plan.status = 'cancelled';
        await plan.save();
        return mapToIAuditPlan(plan.toObject());
    }
    // ============================================================
    // INICIAR AUDITORIA
    // ============================================================
    async startAudit(id, userId) {
        const plan = await AuditPlan_1.AuditPlan.findById(id);
        if (!plan)
            throw new Error('Plano não encontrado');
        const isTeamMember = plan.team.leadAuditor === userId ||
            plan.team.auditors.includes(userId);
        if (!isTeamMember) {
            throw new Error('Apenas membros da equipe de auditoria podem iniciar a auditoria');
        }
        if (plan.status !== 'approved') {
            throw new Error('Apenas planos aprovados podem ser iniciados');
        }
        plan.status = 'in_progress';
        await plan.save();
        return mapToIAuditPlan(plan.toObject());
    }
    // ============================================================
    // CONCLUIR AUDITORIA
    // ============================================================
    async completeAudit(id, userId) {
        const plan = await AuditPlan_1.AuditPlan.findById(id);
        if (!plan)
            throw new Error('Plano não encontrado');
        if (plan.team.leadAuditor !== userId) {
            throw new Error('Apenas o auditor líder pode concluir a auditoria');
        }
        if (plan.status !== 'in_progress') {
            throw new Error('Apenas auditorias em andamento podem ser concluídas');
        }
        plan.status = 'completed';
        await plan.save();
        return mapToIAuditPlan(plan.toObject());
    }
    // ============================================================
    // VERIFICAR PERMISSÃO DE PLANO EMPRESARIAL
    // ============================================================
    async validateEnterpriseAccess(companyId) {
        return true;
    }
    // ============================================================
    // ESTATÍSTICAS DE AUDITORIA
    // ============================================================
    async getStats(companyId) {
        const totalPlans = await AuditPlan_1.AuditPlan.countDocuments({ companyId });
        const approved = await AuditPlan_1.AuditPlan.countDocuments({ companyId, status: 'approved' });
        const inProgress = await AuditPlan_1.AuditPlan.countDocuments({ companyId, status: 'in_progress' });
        const completed = await AuditPlan_1.AuditPlan.countDocuments({ companyId, status: 'completed' });
        return {
            totalPlans,
            approved,
            inProgress,
            completed,
        };
    }
}
exports.AuditPlanService = AuditPlanService;
//# sourceMappingURL=AuditPlanService.js.map