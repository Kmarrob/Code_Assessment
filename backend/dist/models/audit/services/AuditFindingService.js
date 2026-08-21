"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditFindingService = void 0;
const AuditFinding_1 = require("../models/AuditFinding");
const AuditPlan_1 = require("../models/AuditPlan");
/**
 * Mapeia documento do MongoDB para IAuditFinding com id
 */
function mapToIAuditFinding(doc) {
    if (!doc)
        return null;
    return {
        id: doc._id.toString(),
        ...doc,
    };
}
/**
 * Mapeia array de documentos para IAuditFinding[]
 */
function mapToIAuditFindingArray(docs) {
    if (!docs)
        return [];
    return docs.map(doc => mapToIAuditFinding(doc));
}
class AuditFindingService {
    // ============================================================
    // CRIAR NC
    // ============================================================
    async create(data, auditPlanId, createdBy) {
        // Verificar se o plano existe
        const plan = await AuditPlan_1.AuditPlan.findById(auditPlanId);
        if (!plan)
            throw new Error('Plano de auditoria não encontrado');
        // Verificar se o criador faz parte da equipe de auditoria
        const isTeamMember = plan.team.leadAuditor === createdBy ||
            plan.team.auditors.includes(createdBy);
        if (!isTeamMember) {
            throw new Error('Apenas membros da equipe de auditoria podem criar NCs');
        }
        // TODO: Verificar se o auditor não está auditando sua própria área
        // await this.validateAuditorNotAuditingOwnArea(createdBy, data.area);
        const finding = new AuditFinding_1.AuditFinding({
            ...data,
            auditPlanId,
            createdBy,
            status: 'open',
        });
        await finding.save();
        return mapToIAuditFinding(finding.toObject());
    }
    // ============================================================
    // LISTAR NCs POR PLANO
    // ============================================================
    async findByPlanId(auditPlanId) {
        const docs = await AuditFinding_1.AuditFinding.find({ auditPlanId }).sort({ createdAt: -1 }).lean();
        return mapToIAuditFindingArray(docs);
    }
    // ============================================================
    // LISTAR NCs COM FILTROS
    // ============================================================
    async findAll(filters) {
        const query = {};
        if (filters.auditPlanId)
            query.auditPlanId = filters.auditPlanId;
        if (filters.type)
            query.type = filters.type;
        if (filters.status)
            query.status = filters.status;
        if (filters.area)
            query.area = filters.area;
        if (filters.createdBy)
            query.createdBy = filters.createdBy;
        const docs = await AuditFinding_1.AuditFinding.find(query).sort({ createdAt: -1 }).lean();
        return mapToIAuditFindingArray(docs);
    }
    // ============================================================
    // BUSCAR NC POR ID
    // ============================================================
    async findById(id) {
        const doc = await AuditFinding_1.AuditFinding.findById(id).lean();
        if (!doc)
            return null;
        return mapToIAuditFinding(doc);
    }
    // ============================================================
    // ATUALIZAR NC
    // ============================================================
    async update(id, data, userId) {
        const finding = await AuditFinding_1.AuditFinding.findById(id);
        if (!finding)
            throw new Error('NC não encontrada');
        // Apenas o criador pode editar NCs abertas
        if (finding.createdBy !== userId) {
            throw new Error('Apenas o criador pode editar esta NC');
        }
        if (finding.status !== 'open' && finding.status !== 'in_progress') {
            throw new Error('Apenas NCs abertas ou em andamento podem ser editadas');
        }
        Object.assign(finding, data);
        await finding.save();
        return mapToIAuditFinding(finding.toObject());
    }
    // ============================================================
    // VALIDAR NC (FECHAR/REABRIR)
    // ============================================================
    async validate(id, validatorId, status, comment) {
        const finding = await AuditFinding_1.AuditFinding.findById(id);
        if (!finding)
            throw new Error('NC não encontrada');
        // Validar: validatorId não pode ser o mesmo que createdBy
        if (finding.createdBy === validatorId) {
            throw new Error('O validador não pode ser o mesmo que criou a NC');
        }
        // Verificar se o validador é REP ou ADMIN ou leadAuditor
        // TODO: Verificar permissões
        if (status === 'closed' && finding.status !== 'pending_validation') {
            throw new Error('Apenas NCs aguardando validação podem ser fechadas');
        }
        if (status === 'reopened' && finding.status !== 'closed') {
            throw new Error('Apenas NCs fechadas podem ser reabertas');
        }
        finding.status = status;
        finding.validatedBy = validatorId;
        finding.validatedAt = new Date();
        await finding.save();
        // TODO: Enviar notificação para o criador da NC
        return mapToIAuditFinding(finding.toObject());
    }
    // ============================================================
    // ENVIAR NC PARA VALIDAÇÃO
    // ============================================================
    async submitForValidation(id, userId) {
        const finding = await AuditFinding_1.AuditFinding.findById(id);
        if (!finding)
            throw new Error('NC não encontrada');
        // Apenas o criador pode enviar para validação
        if (finding.createdBy !== userId) {
            throw new Error('Apenas o criador pode enviar esta NC para validação');
        }
        if (finding.status !== 'in_progress') {
            throw new Error('Apenas NCs em andamento podem ser enviadas para validação');
        }
        finding.status = 'pending_validation';
        await finding.save();
        return mapToIAuditFinding(finding.toObject());
    }
    // ============================================================
    // ESTATÍSTICAS DE NCs
    // ============================================================
    async getStats(auditPlanId) {
        const total = await AuditFinding_1.AuditFinding.countDocuments({ auditPlanId });
        const open = await AuditFinding_1.AuditFinding.countDocuments({ auditPlanId, status: { $in: ['open', 'in_progress'] } });
        const closed = await AuditFinding_1.AuditFinding.countDocuments({ auditPlanId, status: 'closed' });
        const ncA = await AuditFinding_1.AuditFinding.countDocuments({ auditPlanId, type: 'nc_a' });
        const ncB = await AuditFinding_1.AuditFinding.countDocuments({ auditPlanId, type: 'nc_b' });
        const pendingValidation = await AuditFinding_1.AuditFinding.countDocuments({ auditPlanId, status: 'pending_validation' });
        return { total, open, closed, ncA, ncB, pendingValidation };
    }
    // ============================================================
    // VALIDAR AUDITOR NÃO AUDITAR PRÓPRIA ÁREA
    // ============================================================
    async validateAuditorNotAuditingOwnArea(auditorId, area) {
        // TODO: Buscar a área do auditor e verificar se é a mesma
        // Se for a mesma, lançar erro
    }
}
exports.AuditFindingService = AuditFindingService;
//# sourceMappingURL=AuditFindingService.js.map