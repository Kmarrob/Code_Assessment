"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditFindingController = void 0;
const AuditFindingService_1 = require("../../models/audit/services/AuditFindingService");
const AuditFinding_1 = require("../../models/audit/models/AuditFinding");
const auditFindingService = new AuditFindingService_1.AuditFindingService();
class AuditFindingController {
    // ============================================================
    // CRIAR NC
    // ============================================================
    async create(req, res) {
        try {
            const userId = req.user?._id?.toString();
            const { auditPlanId } = req.params;
            if (!userId) {
                return res.status(401).json({ success: false, message: 'Usuário não autenticado' });
            }
            if (!auditPlanId) {
                return res.status(400).json({ success: false, message: 'ID do plano é obrigatório' });
            }
            const data = req.body;
            const finding = await auditFindingService.create(data, auditPlanId, userId);
            return res.status(201).json({ success: true, data: finding });
        }
        catch (error) {
            return res.status(400).json({ success: false, message: error.message });
        }
    }
    // ============================================================
    // LISTAR NCs POR PLANO
    // ============================================================
    async findByPlanId(req, res) {
        try {
            const { auditPlanId } = req.params;
            if (!auditPlanId) {
                return res.status(400).json({ success: false, message: 'ID do plano é obrigatório' });
            }
            const findings = await auditFindingService.findByPlanId(auditPlanId);
            return res.status(200).json({ success: true, data: findings });
        }
        catch (error) {
            return res.status(400).json({ success: false, message: error.message });
        }
    }
    // ============================================================
    // LISTAR NCs COM FILTROS
    // ============================================================
    async findAll(req, res) {
        try {
            const { auditPlanId, type, status, area, createdBy } = req.query;
            const filters = {
                auditPlanId: auditPlanId,
                type: type,
                status: status,
                area: area,
                createdBy: createdBy,
            };
            const findings = await auditFindingService.findAll(filters);
            return res.status(200).json({ success: true, data: findings });
        }
        catch (error) {
            return res.status(400).json({ success: false, message: error.message });
        }
    }
    // ============================================================
    // BUSCAR NC POR ID
    // ============================================================
    async findById(req, res) {
        try {
            const { id } = req.params;
            if (!id) {
                return res.status(400).json({ success: false, message: 'ID não informado' });
            }
            const finding = await auditFindingService.findById(id);
            if (!finding) {
                return res.status(404).json({ success: false, message: 'NC não encontrada' });
            }
            return res.status(200).json({ success: true, data: finding });
        }
        catch (error) {
            return res.status(400).json({ success: false, message: error.message });
        }
    }
    // ============================================================
    // ATUALIZAR NC
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
            const finding = await auditFindingService.update(id, data, userId);
            if (!finding) {
                return res.status(404).json({ success: false, message: 'NC não encontrada' });
            }
            return res.status(200).json({ success: true, data: finding });
        }
        catch (error) {
            return res.status(400).json({ success: false, message: error.message });
        }
    }
    // ============================================================
    // DELETAR NC (SOFT DELETE)
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
            // Buscar a NC para verificar se existe e se o usuário tem permissão
            const finding = await AuditFinding_1.AuditFinding.findById(id);
            if (!finding) {
                return res.status(404).json({ success: false, message: 'NC não encontrada' });
            }
            // Apenas o criador ou um usuário com permissão pode excluir
            if (finding.createdBy !== userId) {
                // TODO: Verificar se o usuário é ADMIN ou REP
                // Por enquanto, permitir apenas o criador
                return res.status(403).json({ success: false, message: 'Apenas o criador pode excluir esta NC' });
            }
            // Soft delete: marcar como excluído
            finding.deletedAt = new Date();
            await finding.save();
            return res.status(200).json({ success: true, message: 'NC excluída com sucesso' });
        }
        catch (error) {
            return res.status(400).json({ success: false, message: error.message });
        }
    }
    // ============================================================
    // ENVIAR NC PARA VALIDAÇÃO (corresponde a submit na rota)
    // ============================================================
    async submitForValidation(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user?._id?.toString();
            if (!id) {
                return res.status(400).json({ success: false, message: 'ID não informado' });
            }
            if (!userId) {
                return res.status(401).json({ success: false, message: 'Usuário não autenticado' });
            }
            const finding = await auditFindingService.submitForValidation(id, userId);
            if (!finding) {
                return res.status(404).json({ success: false, message: 'NC não encontrada' });
            }
            return res.status(200).json({ success: true, data: finding });
        }
        catch (error) {
            return res.status(400).json({ success: false, message: error.message });
        }
    }
    // ============================================================
    // VALIDAR NC (FECHAR/REABRIR)
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
            if (!status || !['closed', 'reopened'].includes(status)) {
                return res.status(400).json({ success: false, message: 'Status deve ser "closed" ou "reopened"' });
            }
            const finding = await auditFindingService.validate(id, userId, status, comment);
            if (!finding) {
                return res.status(404).json({ success: false, message: 'NC não encontrada' });
            }
            return res.status(200).json({ success: true, data: finding });
        }
        catch (error) {
            return res.status(400).json({ success: false, message: error.message });
        }
    }
    // ============================================================
    // ESTATÍSTICAS DE NCs
    // ============================================================
    async getStats(req, res) {
        try {
            const { auditPlanId } = req.params;
            if (!auditPlanId) {
                return res.status(400).json({ success: false, message: 'ID do plano é obrigatório' });
            }
            const stats = await auditFindingService.getStats(auditPlanId);
            return res.status(200).json({ success: true, data: stats });
        }
        catch (error) {
            return res.status(400).json({ success: false, message: error.message });
        }
    }
}
exports.AuditFindingController = AuditFindingController;
//# sourceMappingURL=AuditFindingController.js.map