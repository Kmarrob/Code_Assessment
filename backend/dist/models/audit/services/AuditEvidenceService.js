"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditEvidenceService = void 0;
const AuditEvidence_1 = require("../models/AuditEvidence");
class AuditEvidenceService {
    // ============================================================
    // CRIAR EVIDÊNCIA
    // ============================================================
    async create(data, uploadedBy) {
        const evidence = new AuditEvidence_1.AuditEvidence({
            ...data,
            uploadedBy,
            uploadedAt: new Date(),
        });
        await evidence.save();
        return evidence.toObject();
    }
    // ============================================================
    // LISTAR EVIDÊNCIAS POR PLANO
    // ============================================================
    async findByPlanId(auditPlanId) {
        return AuditEvidence_1.AuditEvidence.find({ auditPlanId }).sort({ uploadedAt: -1 }).lean();
    }
    // ============================================================
    // LISTAR EVIDÊNCIAS POR NC
    // ============================================================
    async findByFindingId(findingId) {
        return AuditEvidence_1.AuditEvidence.find({ findingId }).sort({ uploadedAt: -1 }).lean();
    }
    // ============================================================
    // BUSCAR EVIDÊNCIA POR ID
    // ============================================================
    async findById(id) {
        return AuditEvidence_1.AuditEvidence.findById(id).lean();
    }
    // ============================================================
    // EXCLUIR EVIDÊNCIA
    // ============================================================
    async delete(id, userId) {
        const evidence = await AuditEvidence_1.AuditEvidence.findById(id);
        if (!evidence)
            throw new Error('Evidência não encontrada');
        // Apenas o uploader ou ADMIN pode excluir
        if (evidence.uploadedBy !== userId) {
            // TODO: Verificar se é ADMIN
        }
        // TODO: Excluir arquivo físico do disco
        await AuditEvidence_1.AuditEvidence.findByIdAndDelete(id);
        return true;
    }
}
exports.AuditEvidenceService = AuditEvidenceService;
//# sourceMappingURL=AuditEvidenceService.js.map