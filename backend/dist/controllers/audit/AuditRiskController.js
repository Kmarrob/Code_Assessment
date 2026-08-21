"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.auditRiskController = exports.AuditRiskController = void 0;
const AuditRiskService_1 = require("../../models/audit/services/AuditRiskService");
class AuditRiskController {
    /**
     * Criar novo risco
     * POST /api/internal-audit/risks
     */
    async create(req, res) {
        try {
            const { companyId, auditPlanId, description, eventOrAsset, owner, threat, vulnerability, existingControl, probability, impact, riskClassification, treatment, treatmentPlan, probabilityAfter, impactAfter, treatmentDeadline, status, } = req.body;
            const userId = req.user?._id?.toString();
            if (!userId) {
                return res.status(401).json({ error: 'Usuário não autenticado' });
            }
            if (!companyId) {
                return res.status(400).json({ error: 'companyId é obrigatório' });
            }
            if (!description) {
                return res.status(400).json({ error: 'description é obrigatório' });
            }
            if (!eventOrAsset) {
                return res.status(400).json({ error: 'eventOrAsset é obrigatório' });
            }
            if (!owner) {
                return res.status(400).json({ error: 'owner é obrigatório' });
            }
            if (!threat) {
                return res.status(400).json({ error: 'threat é obrigatório' });
            }
            if (!vulnerability) {
                return res.status(400).json({ error: 'vulnerability é obrigatório' });
            }
            if (!existingControl) {
                return res.status(400).json({ error: 'existingControl é obrigatório' });
            }
            if (!probability) {
                return res.status(400).json({ error: 'probability é obrigatório' });
            }
            if (!impact) {
                return res.status(400).json({ error: 'impact é obrigatório' });
            }
            if (!riskClassification) {
                return res.status(400).json({ error: 'riskClassification é obrigatório' });
            }
            const risk = await AuditRiskService_1.auditRiskService.create({
                companyId,
                auditPlanId,
                description,
                eventOrAsset,
                owner,
                threat,
                vulnerability,
                existingControl,
                probability,
                impact,
                riskClassification,
                treatment: treatment || 'mitigate',
                treatmentPlan: treatmentPlan || '',
                probabilityAfter: probabilityAfter || probability,
                impactAfter: impactAfter || impact,
                treatmentDeadline: treatmentDeadline ? new Date(treatmentDeadline) : undefined,
                status: status || 'identified',
                createdBy: userId,
                updatedBy: userId,
            });
            return res.status(201).json(risk);
        }
        catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
    /**
     * Buscar risco por ID
     * GET /api/internal-audit/risks/:id
     */
    async findById(req, res) {
        try {
            const { id } = req.params;
            if (!id) {
                return res.status(400).json({ error: 'ID é obrigatório' });
            }
            const risk = await AuditRiskService_1.auditRiskService.findById(id);
            if (!risk) {
                return res.status(404).json({ error: 'Risco não encontrado' });
            }
            return res.json(risk);
        }
        catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
    /**
     * Buscar risco por ID (identificador único)
     * GET /api/internal-audit/risks/company/:companyId/risk-id/:riskId
     */
    async findByRiskId(req, res) {
        try {
            const { companyId, riskId } = req.params;
            if (!companyId) {
                return res.status(400).json({ error: 'companyId é obrigatório' });
            }
            if (!riskId) {
                return res.status(400).json({ error: 'riskId é obrigatório' });
            }
            const risk = await AuditRiskService_1.auditRiskService.findByRiskId(companyId, riskId);
            if (!risk) {
                return res.status(404).json({ error: 'Risco não encontrado' });
            }
            return res.json(risk);
        }
        catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
    /**
     * Listar riscos de uma empresa
     * GET /api/internal-audit/risks/company/:companyId
     */
    async findAllByCompany(req, res) {
        try {
            const { companyId } = req.params;
            if (!companyId) {
                return res.status(400).json({ error: 'companyId é obrigatório' });
            }
            const { status, riskLevel, auditPlanId, limit, skip } = req.query;
            const risks = await AuditRiskService_1.auditRiskService.findAllByCompany(companyId, {
                status: status,
                riskLevel: riskLevel,
                auditPlanId: auditPlanId,
                limit: limit ? parseInt(limit) : undefined,
                skip: skip ? parseInt(skip) : undefined,
            });
            return res.json(risks);
        }
        catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
    /**
     * Atualizar risco
     * PUT /api/internal-audit/risks/:id
     */
    async update(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user?._id?.toString();
            if (!userId) {
                return res.status(401).json({ error: 'Usuário não autenticado' });
            }
            if (!id) {
                return res.status(400).json({ error: 'ID é obrigatório' });
            }
            const data = req.body;
            data.updatedBy = userId;
            // Converter datas
            if (data.treatmentDeadline) {
                data.treatmentDeadline = new Date(data.treatmentDeadline);
            }
            if (data.treatedAt) {
                data.treatedAt = new Date(data.treatedAt);
            }
            const risk = await AuditRiskService_1.auditRiskService.update(id, data);
            if (!risk) {
                return res.status(404).json({ error: 'Risco não encontrado' });
            }
            return res.json(risk);
        }
        catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
    /**
     * Atualizar avaliação do risco
     * PUT /api/internal-audit/risks/:id/assessment
     */
    async updateAssessment(req, res) {
        try {
            const { id } = req.params;
            const { probability, impact } = req.body;
            const userId = req.user?._id?.toString();
            if (!userId) {
                return res.status(401).json({ error: 'Usuário não autenticado' });
            }
            if (!id) {
                return res.status(400).json({ error: 'ID é obrigatório' });
            }
            if (!probability) {
                return res.status(400).json({ error: 'probability é obrigatório' });
            }
            if (!impact) {
                return res.status(400).json({ error: 'impact é obrigatório' });
            }
            const risk = await AuditRiskService_1.auditRiskService.updateAssessment(id, {
                probability,
                impact,
                updatedBy: userId,
            });
            if (!risk) {
                return res.status(404).json({ error: 'Risco não encontrado' });
            }
            return res.json(risk);
        }
        catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
    /**
     * Tratar risco
     * POST /api/internal-audit/risks/:id/treat
     */
    async treatRisk(req, res) {
        try {
            const { id } = req.params;
            const { treatment, treatmentPlan, probabilityAfter, impactAfter, treatmentDeadline, } = req.body;
            const userId = req.user?._id?.toString();
            if (!userId) {
                return res.status(401).json({ error: 'Usuário não autenticado' });
            }
            if (!id) {
                return res.status(400).json({ error: 'ID é obrigatório' });
            }
            if (!treatment) {
                return res.status(400).json({ error: 'treatment é obrigatório' });
            }
            if (!treatmentPlan) {
                return res.status(400).json({ error: 'treatmentPlan é obrigatório' });
            }
            if (!probabilityAfter) {
                return res.status(400).json({ error: 'probabilityAfter é obrigatório' });
            }
            if (!impactAfter) {
                return res.status(400).json({ error: 'impactAfter é obrigatório' });
            }
            const risk = await AuditRiskService_1.auditRiskService.treatRisk(id, {
                treatment,
                treatmentPlan,
                probabilityAfter,
                impactAfter,
                treatmentDeadline: treatmentDeadline ? new Date(treatmentDeadline) : undefined,
                treatedBy: userId,
            });
            if (!risk) {
                return res.status(404).json({ error: 'Risco não encontrado' });
            }
            return res.json(risk);
        }
        catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
    /**
     * Monitorar risco
     * PUT /api/internal-audit/risks/:id/monitor
     */
    async monitorRisk(req, res) {
        try {
            const { id } = req.params;
            const { status } = req.body;
            const userId = req.user?._id?.toString();
            if (!userId) {
                return res.status(401).json({ error: 'Usuário não autenticado' });
            }
            if (!id) {
                return res.status(400).json({ error: 'ID é obrigatório' });
            }
            if (!status) {
                return res.status(400).json({ error: 'status é obrigatório' });
            }
            if (status !== 'monitored' && status !== 'closed') {
                return res.status(400).json({ error: 'Status inválido. Use "monitored" ou "closed"' });
            }
            const risk = await AuditRiskService_1.auditRiskService.monitorRisk(id, {
                status,
                updatedBy: userId,
            });
            if (!risk) {
                return res.status(404).json({ error: 'Risco não encontrado' });
            }
            return res.json(risk);
        }
        catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
    /**
     * Reabrir risco
     * POST /api/internal-audit/risks/:id/reopen
     */
    async reopenRisk(req, res) {
        try {
            const { id } = req.params;
            const { reason } = req.body;
            const userId = req.user?._id?.toString();
            if (!userId) {
                return res.status(401).json({ error: 'Usuário não autenticado' });
            }
            if (!id) {
                return res.status(400).json({ error: 'ID é obrigatório' });
            }
            if (!reason) {
                return res.status(400).json({ error: 'reason é obrigatório' });
            }
            const risk = await AuditRiskService_1.auditRiskService.reopenRisk(id, {
                reason,
                updatedBy: userId,
            });
            if (!risk) {
                return res.status(404).json({ error: 'Risco não encontrado' });
            }
            return res.json(risk);
        }
        catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
    /**
     * Excluir risco
     * DELETE /api/internal-audit/risks/:id
     */
    async delete(req, res) {
        try {
            const { id } = req.params;
            if (!id) {
                return res.status(400).json({ error: 'ID é obrigatório' });
            }
            const risk = await AuditRiskService_1.auditRiskService.delete(id);
            if (!risk) {
                return res.status(404).json({ error: 'Risco não encontrado' });
            }
            return res.json({ message: 'Risco excluído com sucesso' });
        }
        catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
    /**
     * Obter estatísticas de riscos
     * GET /api/internal-audit/risks/company/:companyId/stats
     */
    async getStatistics(req, res) {
        try {
            const { companyId } = req.params;
            if (!companyId) {
                return res.status(400).json({ error: 'companyId é obrigatório' });
            }
            const stats = await AuditRiskService_1.auditRiskService.getStatistics(companyId);
            return res.json(stats);
        }
        catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
    /**
     * Obter riscos críticos
     * GET /api/internal-audit/risks/company/:companyId/critical
     */
    async getCriticalRisks(req, res) {
        try {
            const { companyId } = req.params;
            if (!companyId) {
                return res.status(400).json({ error: 'companyId é obrigatório' });
            }
            const risks = await AuditRiskService_1.auditRiskService.getCriticalRisks(companyId);
            return res.json(risks);
        }
        catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
    /**
     * Exportar riscos para formato de planilha
     * GET /api/internal-audit/risks/company/:companyId/export
     */
    async exportToSpreadsheet(req, res) {
        try {
            const { companyId } = req.params;
            if (!companyId) {
                return res.status(400).json({ error: 'companyId é obrigatório' });
            }
            const data = await AuditRiskService_1.auditRiskService.exportToSpreadsheet(companyId);
            return res.json(data);
        }
        catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
}
exports.AuditRiskController = AuditRiskController;
exports.auditRiskController = new AuditRiskController();
//# sourceMappingURL=AuditRiskController.js.map