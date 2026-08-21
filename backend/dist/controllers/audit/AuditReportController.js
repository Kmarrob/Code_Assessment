"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditReportController = void 0;
const AuditReportService_1 = require("../../models/audit/services/AuditReportService");
const auditReportService = new AuditReportService_1.AuditReportService();
class AuditReportController {
    // ============================================================
    // CRIAR RELATÓRIO
    // ============================================================
    async create(req, res) {
        try {
            const userId = req.user?._id?.toString();
            if (!userId) {
                return res.status(401).json({ success: false, message: 'Usuário não autenticado' });
            }
            const data = req.body;
            if (!data.auditPlanId) {
                return res.status(400).json({ success: false, message: 'ID do plano é obrigatório' });
            }
            const report = await auditReportService.create(data, userId);
            return res.status(201).json({ success: true, data: report });
        }
        catch (error) {
            return res.status(400).json({ success: false, message: error.message });
        }
    }
    // ============================================================
    // LISTAR RELATÓRIOS
    // ============================================================
    async findAll(req, res) {
        try {
            const { auditPlanId, status, createdBy } = req.query;
            const filters = {
                auditPlanId: auditPlanId,
                status: status,
                createdBy: createdBy,
            };
            const reports = await auditReportService.findAll(filters);
            return res.status(200).json({ success: true, data: reports });
        }
        catch (error) {
            return res.status(400).json({ success: false, message: error.message });
        }
    }
    // ============================================================
    // BUSCAR RELATÓRIO POR ID
    // ============================================================
    async findById(req, res) {
        try {
            const { id } = req.params;
            if (!id) {
                return res.status(400).json({ success: false, message: 'ID não informado' });
            }
            const report = await auditReportService.findById(id);
            if (!report) {
                return res.status(404).json({ success: false, message: 'Relatório não encontrado' });
            }
            return res.status(200).json({ success: true, data: report });
        }
        catch (error) {
            return res.status(400).json({ success: false, message: error.message });
        }
    }
    // ============================================================
    // BUSCAR RELATÓRIO POR PLANO
    // ============================================================
    async findByPlanId(req, res) {
        try {
            const { auditPlanId } = req.params;
            if (!auditPlanId) {
                return res.status(400).json({ success: false, message: 'ID do plano é obrigatório' });
            }
            const reports = await auditReportService.findByPlanId(auditPlanId);
            return res.status(200).json({ success: true, data: reports });
        }
        catch (error) {
            return res.status(400).json({ success: false, message: error.message });
        }
    }
    // ============================================================
    // ATUALIZAR RELATÓRIO
    // ============================================================
    async update(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user?._id?.toString();
            const data = req.body;
            if (!id) {
                return res.status(400).json({ success: false, message: 'ID não informado' });
            }
            if (!userId) {
                return res.status(401).json({ success: false, message: 'Usuário não autenticado' });
            }
            const report = await auditReportService.update(id, data, userId);
            if (!report) {
                return res.status(404).json({ success: false, message: 'Relatório não encontrado' });
            }
            return res.status(200).json({ success: true, data: report });
        }
        catch (error) {
            return res.status(400).json({ success: false, message: error.message });
        }
    }
    // ============================================================
    // DELETAR RELATÓRIO
    // ============================================================
    async delete(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user?._id?.toString();
            if (!id) {
                return res.status(400).json({ success: false, message: 'ID não informado' });
            }
            if (!userId) {
                return res.status(401).json({ success: false, message: 'Usuário não autenticado' });
            }
            const report = await auditReportService.reject(id, userId, 'Deletado pelo usuário');
            if (!report) {
                return res.status(404).json({ success: false, message: 'Relatório não encontrado' });
            }
            return res.status(200).json({ success: true, data: report });
        }
        catch (error) {
            return res.status(400).json({ success: false, message: error.message });
        }
    }
    // ============================================================
    // ENVIAR PARA REVISÃO (corresponde a submit na rota)
    // ============================================================
    async submitForReview(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user?._id?.toString();
            if (!id) {
                return res.status(400).json({ success: false, message: 'ID não informado' });
            }
            if (!userId) {
                return res.status(401).json({ success: false, message: 'Usuário não autenticado' });
            }
            const report = await auditReportService.submitForReview(id, userId);
            if (!report) {
                return res.status(404).json({ success: false, message: 'Relatório não encontrado' });
            }
            return res.status(200).json({ success: true, data: report });
        }
        catch (error) {
            return res.status(400).json({ success: false, message: error.message });
        }
    }
    // ============================================================
    // APROVAR RELATÓRIO
    // ============================================================
    async approve(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user?._id?.toString();
            if (!id) {
                return res.status(400).json({ success: false, message: 'ID não informado' });
            }
            if (!userId) {
                return res.status(401).json({ success: false, message: 'Usuário não autenticado' });
            }
            const report = await auditReportService.approve(id, userId);
            if (!report) {
                return res.status(404).json({ success: false, message: 'Relatório não encontrado' });
            }
            return res.status(200).json({ success: true, data: report });
        }
        catch (error) {
            return res.status(400).json({ success: false, message: error.message });
        }
    }
    // ============================================================
    // REJEITAR RELATÓRIO
    // ============================================================
    async reject(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user?._id?.toString();
            const { reason } = req.body;
            if (!id) {
                return res.status(400).json({ success: false, message: 'ID não informado' });
            }
            if (!userId) {
                return res.status(401).json({ success: false, message: 'Usuário não autenticado' });
            }
            if (!reason) {
                return res.status(400).json({ success: false, message: 'Motivo da rejeição é obrigatório' });
            }
            const report = await auditReportService.reject(id, userId, reason);
            if (!report) {
                return res.status(404).json({ success: false, message: 'Relatório não encontrado' });
            }
            return res.status(200).json({ success: true, data: report });
        }
        catch (error) {
            return res.status(400).json({ success: false, message: error.message });
        }
    }
    // ============================================================
    // GERAR RELATÓRIO AUTOMÁTICO (corresponde a generate na rota)
    // ============================================================
    async generateAutoReport(req, res) {
        try {
            const { auditPlanId } = req.params;
            if (!auditPlanId) {
                return res.status(400).json({ success: false, message: 'ID do plano é obrigatório' });
            }
            const report = await auditReportService.generateAutoReport(auditPlanId);
            return res.status(200).json({ success: true, data: report });
        }
        catch (error) {
            return res.status(400).json({ success: false, message: error.message });
        }
    }
}
exports.AuditReportController = AuditReportController;
//# sourceMappingURL=AuditReportController.js.map