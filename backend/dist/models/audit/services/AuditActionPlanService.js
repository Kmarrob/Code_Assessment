"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditActionPlanService = void 0;
const AuditActionPlan_1 = require("../models/AuditActionPlan");
const AuditFinding_1 = require("../models/AuditFinding");
/**
 * Mapeia documento do MongoDB para IAuditActionPlan com id
 */
function mapToIAuditActionPlan(doc) {
    if (!doc)
        return null;
    return {
        id: doc._id.toString(),
        ...doc,
    };
}
/**
 * Mapeia array de documentos para IAuditActionPlan[]
 */
function mapToIAuditActionPlanArray(docs) {
    if (!docs)
        return [];
    return docs.map(doc => mapToIAuditActionPlan(doc));
}
class AuditActionPlanService {
    // ============================================================
    // CRIAR PLANO DE AÇÃO
    // ============================================================
    async create(data, createdBy) {
        // Verificar se a NC existe
        const finding = await AuditFinding_1.AuditFinding.findById(data.findingId);
        if (!finding)
            throw new Error('NC não encontrada');
        // Verificar se a NC está aberta
        if (finding.status === 'closed') {
            throw new Error('Não é possível criar plano de ação para NC fechada');
        }
        const actionPlan = new AuditActionPlan_1.AuditActionPlan({
            ...data,
            createdBy,
            status: 'pending',
        });
        await actionPlan.save();
        // Atualizar status da NC para in_progress
        finding.status = 'in_progress';
        await finding.save();
        // TODO: Enviar notificação para o responsável
        return mapToIAuditActionPlan(actionPlan.toObject());
    }
    // ============================================================
    // LISTAR PLANOS DE AÇÃO POR NC
    // ============================================================
    async findByFindingId(findingId) {
        const docs = await AuditActionPlan_1.AuditActionPlan.find({ findingId }).sort({ createdAt: -1 }).lean();
        return mapToIAuditActionPlanArray(docs);
    }
    // ============================================================
    // LISTAR PLANOS DE AÇÃO POR RESPONSÁVEL
    // ============================================================
    async findByResponsible(responsible) {
        const docs = await AuditActionPlan_1.AuditActionPlan.find({ responsible }).sort({ deadline: 1 }).lean();
        return mapToIAuditActionPlanArray(docs);
    }
    // ============================================================
    // BUSCAR PLANO DE AÇÃO POR ID
    // ============================================================
    async findById(id) {
        const doc = await AuditActionPlan_1.AuditActionPlan.findById(id).lean();
        if (!doc)
            return null;
        return mapToIAuditActionPlan(doc);
    }
    // ============================================================
    // ATUALIZAR PLANO DE AÇÃO
    // ============================================================
    async update(id, data, userId) {
        const actionPlan = await AuditActionPlan_1.AuditActionPlan.findById(id);
        if (!actionPlan)
            throw new Error('Plano de ação não encontrado');
        // Apenas o responsável ou criador pode editar
        if (actionPlan.responsible !== userId && actionPlan.createdBy !== userId) {
            throw new Error('Apenas o responsável ou o criador pode editar este plano de ação');
        }
        if (actionPlan.status === 'completed' || actionPlan.status === 'rejected') {
            throw new Error('Não é possível editar um plano de ação concluído ou rejeitado');
        }
        Object.assign(actionPlan, data);
        await actionPlan.save();
        return mapToIAuditActionPlan(actionPlan.toObject());
    }
    // ============================================================
    // MARCAR COMO EM ANDAMENTO
    // ============================================================
    async startProgress(id, userId) {
        const actionPlan = await AuditActionPlan_1.AuditActionPlan.findById(id);
        if (!actionPlan)
            throw new Error('Plano de ação não encontrado');
        if (actionPlan.responsible !== userId) {
            throw new Error('Apenas o responsável pode iniciar a execução do plano de ação');
        }
        if (actionPlan.status !== 'pending') {
            throw new Error('Apenas planos de ação pendentes podem ser iniciados');
        }
        actionPlan.status = 'in_progress';
        await actionPlan.save();
        return mapToIAuditActionPlan(actionPlan.toObject());
    }
    // ============================================================
    // MARCAR COMO CONCLUÍDO
    // ============================================================
    async complete(id, userId, evidenceIds) {
        const actionPlan = await AuditActionPlan_1.AuditActionPlan.findById(id);
        if (!actionPlan)
            throw new Error('Plano de ação não encontrado');
        if (actionPlan.responsible !== userId) {
            throw new Error('Apenas o responsável pode concluir o plano de ação');
        }
        if (actionPlan.status === 'completed') {
            throw new Error('Plano de ação já está concluído');
        }
        actionPlan.status = 'completed';
        if (evidenceIds) {
            actionPlan.evidenceIds = [...actionPlan.evidenceIds, ...evidenceIds];
        }
        await actionPlan.save();
        // Atualizar status da NC para pending_validation
        await AuditFinding_1.AuditFinding.findByIdAndUpdate(actionPlan.findingId, { status: 'pending_validation' });
        // TODO: Enviar notificação para o auditor
        return mapToIAuditActionPlan(actionPlan.toObject());
    }
    // ============================================================
    // VALIDAR PLANO DE AÇÃO (AUDITOR)
    // ============================================================
    async validate(id, validatorId, status, comment) {
        const actionPlan = await AuditActionPlan_1.AuditActionPlan.findById(id);
        if (!actionPlan)
            throw new Error('Plano de ação não encontrado');
        // Verificar se o validador é o auditor da NC
        // TODO: Verificar permissões
        if (actionPlan.status !== 'completed') {
            throw new Error('Apenas planos de ação concluídos podem ser validados');
        }
        actionPlan.status = status;
        actionPlan.validatedBy = validatorId;
        actionPlan.validatedAt = new Date();
        if (comment) {
            actionPlan.validationComment = comment;
        }
        await actionPlan.save();
        // Se aprovado, fechar a NC
        if (status === 'completed') {
            await AuditFinding_1.AuditFinding.findByIdAndUpdate(actionPlan.findingId, { status: 'closed' });
        }
        // Se rejeitado, reabrir a NC
        if (status === 'rejected') {
            await AuditFinding_1.AuditFinding.findByIdAndUpdate(actionPlan.findingId, { status: 'open' });
        }
        return mapToIAuditActionPlan(actionPlan.toObject());
    }
}
exports.AuditActionPlanService = AuditActionPlanService;
//# sourceMappingURL=AuditActionPlanService.js.map