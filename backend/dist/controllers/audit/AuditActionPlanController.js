"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditActionPlanController = void 0;
const AuditActionPlanService_1 = require("../../models/audit/services/AuditActionPlanService");
const auditActionPlanService = new AuditActionPlanService_1.AuditActionPlanService();
class AuditActionPlanController {
    // ============================================================
    // CRIAR PLANO DE AÇÃO
    // ============================================================
    async create(req, res) {
        try {
            const userId = req.user?._id?.toString();
            if (!userId) {
                return res.status(401).json({ success: false, message: 'Usuário não autenticado' });
            }
            const data = req.body;
            if (!data.findingId) {
                return res.status(400).json({ success: false, message: 'ID da NC é obrigatório' });
            }
            const actionPlan = await auditActionPlanService.create(data, userId);
            return res.status(201).json({ success: true, data: actionPlan });
        }
        catch (error) {
            return res.status(400).json({ success: false, message: error.message });
        }
    }
    // ============================================================
    // LISTAR PLANOS DE AÇÃO POR NC
    // ============================================================
    async findByFindingId(req, res) {
        try {
            const { findingId } = req.params;
            if (!findingId) {
                return res.status(400).json({ success: false, message: 'ID da NC é obrigatório' });
            }
            const actionPlans = await auditActionPlanService.findByFindingId(findingId);
            return res.status(200).json({ success: true, data: actionPlans });
        }
        catch (error) {
            return res.status(400).json({ success: false, message: error.message });
        }
    }
    // ============================================================
    // LISTAR PLANOS DE AÇÃO POR RESPONSÁVEL
    // ============================================================
    async findByResponsible(req, res) {
        try {
            const { responsible } = req.params;
            if (!responsible) {
                return res.status(400).json({ success: false, message: 'ID do responsável é obrigatório' });
            }
            const actionPlans = await auditActionPlanService.findByResponsible(responsible);
            return res.status(200).json({ success: true, data: actionPlans });
        }
        catch (error) {
            return res.status(400).json({ success: false, message: error.message });
        }
    }
    // ============================================================
    // BUSCAR PLANO DE AÇÃO POR ID
    // ============================================================
    async findById(req, res) {
        try {
            const { id } = req.params;
            if (!id) {
                return res.status(400).json({ success: false, message: 'ID não informado' });
            }
            const actionPlan = await auditActionPlanService.findById(id);
            if (!actionPlan) {
                return res.status(404).json({ success: false, message: 'Plano de ação não encontrado' });
            }
            return res.status(200).json({ success: true, data: actionPlan });
        }
        catch (error) {
            return res.status(400).json({ success: false, message: error.message });
        }
    }
    // ============================================================
    // ATUALIZAR PLANO DE AÇÃO
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
            const actionPlan = await auditActionPlanService.update(id, data, userId);
            if (!actionPlan) {
                return res.status(404).json({ success: false, message: 'Plano de ação não encontrado' });
            }
            return res.status(200).json({ success: true, data: actionPlan });
        }
        catch (error) {
            return res.status(400).json({ success: false, message: error.message });
        }
    }
    // ============================================================
    // DELETAR PLANO DE AÇÃO (SOFT DELETE)
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
            const actionPlan = await auditActionPlanService.validate(id, userId, 'rejected', 'Deletado pelo usuário');
            if (!actionPlan) {
                return res.status(404).json({ success: false, message: 'Plano de ação não encontrado' });
            }
            return res.status(200).json({ success: true, data: actionPlan });
        }
        catch (error) {
            return res.status(400).json({ success: false, message: error.message });
        }
    }
    // ============================================================
    // MARCAR COMO EM ANDAMENTO (corresponde a start na rota)
    // ============================================================
    async startProgress(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user?._id?.toString();
            if (!id) {
                return res.status(400).json({ success: false, message: 'ID não informado' });
            }
            if (!userId) {
                return res.status(401).json({ success: false, message: 'Usuário não autenticado' });
            }
            const actionPlan = await auditActionPlanService.startProgress(id, userId);
            if (!actionPlan) {
                return res.status(404).json({ success: false, message: 'Plano de ação não encontrado' });
            }
            return res.status(200).json({ success: true, data: actionPlan });
        }
        catch (error) {
            return res.status(400).json({ success: false, message: error.message });
        }
    }
    // ============================================================
    // MARCAR COMO CONCLUÍDO
    // ============================================================
    async complete(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user?._id?.toString();
            const { evidenceIds } = req.body;
            if (!id) {
                return res.status(400).json({ success: false, message: 'ID não informado' });
            }
            if (!userId) {
                return res.status(401).json({ success: false, message: 'Usuário não autenticado' });
            }
            const actionPlan = await auditActionPlanService.complete(id, userId, evidenceIds);
            if (!actionPlan) {
                return res.status(404).json({ success: false, message: 'Plano de ação não encontrado' });
            }
            return res.status(200).json({ success: true, data: actionPlan });
        }
        catch (error) {
            return res.status(400).json({ success: false, message: error.message });
        }
    }
    // ============================================================
    // VALIDAR PLANO DE AÇÃO
    // ============================================================
    async validate(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user?._id?.toString();
            const { status, comment } = req.body;
            if (!id) {
                return res.status(400).json({ success: false, message: 'ID não informado' });
            }
            if (!userId) {
                return res.status(401).json({ success: false, message: 'Usuário não autenticado' });
            }
            if (!status || !['completed', 'rejected'].includes(status)) {
                return res.status(400).json({ success: false, message: 'Status deve ser "completed" ou "rejected"' });
            }
            const actionPlan = await auditActionPlanService.validate(id, userId, status, comment);
            if (!actionPlan) {
                return res.status(404).json({ success: false, message: 'Plano de ação não encontrado' });
            }
            return res.status(200).json({ success: true, data: actionPlan });
        }
        catch (error) {
            return res.status(400).json({ success: false, message: error.message });
        }
    }
}
exports.AuditActionPlanController = AuditActionPlanController;
//# sourceMappingURL=AuditActionPlanController.js.map