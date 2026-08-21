"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditEvidenceController = void 0;
const AuditEvidenceService_1 = require("../../models/audit/services/AuditEvidenceService");
const auditEvidenceService = new AuditEvidenceService_1.AuditEvidenceService();
class AuditEvidenceController {
    // ============================================================
    // UPLOAD DE EVIDÊNCIA
    // ============================================================
    async upload(req, res) {
        try {
            const userId = req.user?._id?.toString();
            if (!userId) {
                return res.status(401).json({ success: false, message: 'Usuário não autenticado' });
            }
            const { auditPlanId, findingId, description } = req.body;
            if (!auditPlanId) {
                return res.status(400).json({ success: false, message: 'ID do plano é obrigatório' });
            }
            const file = req.file;
            if (!file) {
                return res.status(400).json({ success: false, message: 'Nenhum arquivo enviado' });
            }
            const evidence = await auditEvidenceService.create({
                auditPlanId,
                findingId,
                filename: file.originalname,
                filepath: file.path,
                mimeType: file.mimetype,
                size: file.size,
                description,
            }, userId);
            return res.status(201).json({ success: true, data: evidence });
        }
        catch (error) {
            return res.status(400).json({ success: false, message: error.message });
        }
    }
    // ============================================================
    // LISTAR EVIDÊNCIAS POR PLANO
    // ============================================================
    async findByPlanId(req, res) {
        try {
            const { auditPlanId } = req.params;
            if (!auditPlanId) {
                return res.status(400).json({ success: false, message: 'ID do plano é obrigatório' });
            }
            const evidences = await auditEvidenceService.findByPlanId(auditPlanId);
            return res.status(200).json({ success: true, data: evidences });
        }
        catch (error) {
            return res.status(400).json({ success: false, message: error.message });
        }
    }
    // ============================================================
    // LISTAR EVIDÊNCIAS POR NC
    // ============================================================
    async findByFindingId(req, res) {
        try {
            const { findingId } = req.params;
            if (!findingId) {
                return res.status(400).json({ success: false, message: 'ID da NC é obrigatório' });
            }
            const evidences = await auditEvidenceService.findByFindingId(findingId);
            return res.status(200).json({ success: true, data: evidences });
        }
        catch (error) {
            return res.status(400).json({ success: false, message: error.message });
        }
    }
    // ============================================================
    // BUSCAR EVIDÊNCIA POR ID
    // ============================================================
    async findById(req, res) {
        try {
            const { id } = req.params;
            if (!id) {
                return res.status(400).json({ success: false, message: 'ID não informado' });
            }
            const evidence = await auditEvidenceService.findById(id);
            if (!evidence) {
                return res.status(404).json({ success: false, message: 'Evidência não encontrada' });
            }
            return res.status(200).json({ success: true, data: evidence });
        }
        catch (error) {
            return res.status(400).json({ success: false, message: error.message });
        }
    }
    // ============================================================
    // EXCLUIR EVIDÊNCIA
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
            await auditEvidenceService.delete(id, userId);
            return res.status(200).json({ success: true, message: 'Evidência excluída com sucesso' });
        }
        catch (error) {
            return res.status(400).json({ success: false, message: error.message });
        }
    }
}
exports.AuditEvidenceController = AuditEvidenceController;
//# sourceMappingURL=AuditEvidenceController.js.map