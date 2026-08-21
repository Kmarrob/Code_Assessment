"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.auditRiskService = exports.AuditRiskService = void 0;
const AuditRisk_1 = require("../models/AuditRisk");
class AuditRiskService {
    /**
     * Criar novo risco
     */
    async create(data) {
        // Gerar ID sequencial
        const count = await AuditRisk_1.AuditRisk.countDocuments({ companyId: data.companyId });
        const riskId = `R-${String(count + 1).padStart(3, '0')}`;
        const risk = new AuditRisk_1.AuditRisk({
            ...data,
            id: riskId,
        });
        return await risk.save();
    }
    /**
     * Buscar risco por ID
     */
    async findById(id) {
        return await AuditRisk_1.AuditRisk.findById(id).lean();
    }
    /**
     * Buscar risco por ID (identificador único)
     */
    async findByRiskId(companyId, riskId) {
        return await AuditRisk_1.AuditRisk.findOne({ companyId, id: riskId }).lean();
    }
    /**
     * Listar riscos de uma empresa
     */
    async findAllByCompany(companyId, options) {
        const query = { companyId };
        if (options?.status) {
            query.status = options.status;
        }
        if (options?.riskLevel) {
            query.riskLevel = options.riskLevel;
        }
        if (options?.auditPlanId) {
            query.auditPlanId = options.auditPlanId;
        }
        let findQuery = AuditRisk_1.AuditRisk.find(query).sort({ createdAt: -1 });
        if (options?.skip) {
            findQuery = findQuery.skip(options.skip);
        }
        if (options?.limit) {
            findQuery = findQuery.limit(options.limit);
        }
        return await findQuery.lean();
    }
    /**
     * Atualizar risco
     */
    async update(id, data) {
        const risk = await AuditRisk_1.AuditRisk.findById(id);
        if (!risk)
            return null;
        Object.assign(risk, data);
        risk.updatedBy = data.updatedBy || risk.updatedBy;
        risk.updatedAt = new Date();
        await risk.save();
        return risk.toObject();
    }
    /**
     * Atualizar avaliação do risco (probabilidade e impacto)
     */
    async updateAssessment(id, data) {
        const risk = await AuditRisk_1.AuditRisk.findById(id);
        if (!risk)
            return null;
        risk.probability = data.probability;
        risk.impact = data.impact;
        risk.updatedBy = data.updatedBy;
        risk.updatedAt = new Date();
        await risk.save();
        return risk.toObject();
    }
    /**
     * Tratar risco (aplicar tratamento)
     */
    async treatRisk(id, data) {
        const risk = await AuditRisk_1.AuditRisk.findById(id);
        if (!risk)
            return null;
        risk.treatment = data.treatment;
        risk.treatmentPlan = data.treatmentPlan;
        risk.probabilityAfter = data.probabilityAfter;
        risk.impactAfter = data.impactAfter;
        risk.status = 'treated';
        risk.treatmentDeadline = data.treatmentDeadline;
        risk.treatedAt = new Date();
        risk.treatedBy = data.treatedBy;
        risk.updatedBy = data.treatedBy;
        risk.updatedAt = new Date();
        await risk.save();
        return risk.toObject();
    }
    /**
     * Monitorar risco (após tratamento)
     */
    async monitorRisk(id, data) {
        const risk = await AuditRisk_1.AuditRisk.findById(id);
        if (!risk)
            return null;
        risk.status = data.status;
        risk.updatedBy = data.updatedBy;
        risk.updatedAt = new Date();
        await risk.save();
        return risk.toObject();
    }
    /**
     * Reabrir risco
     */
    async reopenRisk(id, data) {
        const risk = await AuditRisk_1.AuditRisk.findById(id);
        if (!risk)
            return null;
        risk.status = 'identified';
        risk.updatedBy = data.updatedBy;
        risk.updatedAt = new Date();
        await risk.save();
        return risk.toObject();
    }
    /**
     * Excluir risco (soft delete)
     */
    async delete(id) {
        return await AuditRisk_1.AuditRisk.findByIdAndUpdate(id, {
            deletedAt: new Date(),
            updatedAt: new Date(),
        }, { new: true }).lean();
    }
    /**
     * Obter estatísticas de riscos
     */
    async getStatistics(companyId) {
        const total = await AuditRisk_1.AuditRisk.countDocuments({ companyId });
        const byStatus = await AuditRisk_1.AuditRisk.aggregate([
            { $match: { companyId, deletedAt: null } },
            { $group: { _id: '$status', count: { $sum: 1 } } },
        ]);
        const byRiskLevel = await AuditRisk_1.AuditRisk.aggregate([
            { $match: { companyId, deletedAt: null } },
            { $group: { _id: '$riskLevel', count: { $sum: 1 } } },
        ]);
        const byTreatment = await AuditRisk_1.AuditRisk.aggregate([
            { $match: { companyId, deletedAt: null } },
            { $group: { _id: '$treatment', count: { $sum: 1 } } },
        ]);
        const byResidualRisk = await AuditRisk_1.AuditRisk.aggregate([
            { $match: { companyId, deletedAt: null, status: 'treated' } },
            { $group: { _id: '$residualRisk', count: { $sum: 1 } } },
        ]);
        return {
            total,
            byStatus: byStatus.reduce((acc, item) => {
                acc[item._id] = item.count;
                return acc;
            }, {}),
            byRiskLevel: byRiskLevel.reduce((acc, item) => {
                acc[item._id] = item.count;
                return acc;
            }, {}),
            byTreatment: byTreatment.reduce((acc, item) => {
                acc[item._id] = item.count;
                return acc;
            }, {}),
            byResidualRisk: byResidualRisk.reduce((acc, item) => {
                acc[item._id] = item.count;
                return acc;
            }, {}),
        };
    }
    /**
     * Obter riscos críticos (high e critical)
     */
    async getCriticalRisks(companyId) {
        return await AuditRisk_1.AuditRisk.find({
            companyId,
            riskLevel: { $in: ['high', 'critical'] },
            status: { $ne: 'closed' },
        }).sort({ riskLevel: -1 }).lean();
    }
    /**
     * Exportar riscos para formato de planilha
     */
    async exportToSpreadsheet(companyId) {
        const risks = await AuditRisk_1.AuditRisk.find({ companyId }).sort({ id: 1 }).lean();
        return risks.map(risk => ({
            'ID': risk.id,
            'Descrição do Risco': risk.description,
            'Evento ou Ativo': risk.eventOrAsset,
            'Proprietário do Risco': risk.owner,
            'Ameaça': risk.threat,
            'Vulnerabilidade': risk.vulnerability,
            'Controle Existente': risk.existingControl,
            'Probabilidade': risk.probability,
            'Impacto': risk.impact,
            'Nível do Risco': risk.riskLevel,
            'Classificação do Risco': risk.riskClassification,
            'Tratamento': risk.treatment,
            'Plano de Tratamento': risk.treatmentPlan,
            'Probabilidade Após': risk.probabilityAfter,
            'Impacto Após': risk.impactAfter,
            'Risco Residual': risk.residualRisk,
            'Status': risk.status,
            'Prazo': risk.treatmentDeadline?.toLocaleDateString() || '',
        }));
    }
}
exports.AuditRiskService = AuditRiskService;
exports.auditRiskService = new AuditRiskService();
//# sourceMappingURL=AuditRiskService.js.map