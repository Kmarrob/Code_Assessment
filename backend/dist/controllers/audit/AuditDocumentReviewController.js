"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.auditDocumentReviewController = exports.AuditDocumentReviewController = void 0;
const AuditDocumentReviewService_1 = require("../../models/audit/services/AuditDocumentReviewService");
class AuditDocumentReviewController {
    /**
     * Criar nova revisão de documentação
     * POST /api/internal-audit/document-review
     */
    async create(req, res) {
        try {
            const { companyId, auditPlanId, documents, observations } = req.body;
            const userId = req.user?._id?.toString();
            if (!userId) {
                return res.status(401).json({ error: 'Usuário não autenticado' });
            }
            if (!companyId) {
                return res.status(400).json({ error: 'companyId é obrigatório' });
            }
            if (!auditPlanId) {
                return res.status(400).json({ error: 'auditPlanId é obrigatório' });
            }
            // Verificar se já existe revisão para este plano
            const existing = await AuditDocumentReviewService_1.auditDocumentReviewService.findByAuditPlanId(auditPlanId);
            if (existing) {
                return res.status(409).json({ error: 'Já existe uma revisão de documentação para este plano de auditoria' });
            }
            const review = await AuditDocumentReviewService_1.auditDocumentReviewService.create({
                companyId,
                auditPlanId,
                documents: documents || [],
                createdBy: userId,
                observations,
            });
            return res.status(201).json(review);
        }
        catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
    /**
     * Buscar revisão por ID
     * GET /api/internal-audit/document-review/:id
     */
    async findById(req, res) {
        try {
            const { id } = req.params;
            if (!id) {
                return res.status(400).json({ error: 'ID é obrigatório' });
            }
            const review = await AuditDocumentReviewService_1.auditDocumentReviewService.findById(id);
            if (!review) {
                return res.status(404).json({ error: 'Revisão de documentação não encontrada' });
            }
            return res.json(review);
        }
        catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
    /**
     * Buscar revisão por plano de auditoria
     * GET /api/internal-audit/document-review/plan/:auditPlanId
     */
    async findByAuditPlanId(req, res) {
        try {
            const { auditPlanId } = req.params;
            if (!auditPlanId) {
                return res.status(400).json({ error: 'auditPlanId é obrigatório' });
            }
            const review = await AuditDocumentReviewService_1.auditDocumentReviewService.findByAuditPlanId(auditPlanId);
            if (!review) {
                return res.status(404).json({ error: 'Revisão de documentação não encontrada' });
            }
            return res.json(review);
        }
        catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
    /**
     * Buscar revisões por empresa
     * GET /api/internal-audit/document-review/company/:companyId
     */
    async findAllByCompany(req, res) {
        try {
            const { companyId } = req.params;
            if (!companyId) {
                return res.status(400).json({ error: 'companyId é obrigatório' });
            }
            const reviews = await AuditDocumentReviewService_1.auditDocumentReviewService.findAllByCompany(companyId);
            return res.json(reviews);
        }
        catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
    /**
     * Atualizar revisão
     * PUT /api/internal-audit/document-review/:id
     */
    async update(req, res) {
        try {
            const { id } = req.params;
            const { documents, observations } = req.body;
            if (!id) {
                return res.status(400).json({ error: 'ID é obrigatório' });
            }
            const review = await AuditDocumentReviewService_1.auditDocumentReviewService.update(id, {
                documents,
                observations,
            });
            if (!review) {
                return res.status(404).json({ error: 'Revisão de documentação não encontrada' });
            }
            return res.json(review);
        }
        catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
    /**
     * Atualizar um documento específico da revisão
     * PUT /api/internal-audit/document-review/:id/document/:clause
     */
    async updateDocument(req, res) {
        try {
            const { id, clause } = req.params;
            const { requirement, status, observations, reviewer, reviewDate, documentId, documentName } = req.body;
            if (!id) {
                return res.status(400).json({ error: 'ID é obrigatório' });
            }
            if (!clause) {
                return res.status(400).json({ error: 'Cláusula é obrigatória' });
            }
            const data = {};
            if (requirement !== undefined)
                data.requirement = requirement;
            if (status !== undefined)
                data.status = status;
            if (observations !== undefined)
                data.observations = observations;
            if (reviewer !== undefined)
                data.reviewer = reviewer;
            if (reviewDate !== undefined)
                data.reviewDate = new Date(reviewDate);
            if (documentId !== undefined)
                data.documentId = documentId;
            if (documentName !== undefined)
                data.documentName = documentName;
            const review = await AuditDocumentReviewService_1.auditDocumentReviewService.updateDocument(id, clause, data);
            if (!review) {
                return res.status(404).json({ error: 'Revisão de documentação não encontrada' });
            }
            return res.json(review);
        }
        catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
    /**
     * Atualizar status de um documento
     * PUT /api/internal-audit/document-review/:id/document/:clause/status
     */
    async updateDocumentStatus(req, res) {
        try {
            const { id, clause } = req.params;
            const { status, observations } = req.body;
            if (!id) {
                return res.status(400).json({ error: 'ID é obrigatório' });
            }
            if (!clause) {
                return res.status(400).json({ error: 'Cláusula é obrigatória' });
            }
            if (!status) {
                return res.status(400).json({ error: 'Status é obrigatório' });
            }
            if (!['OK', 'NC_A', 'NC_B', 'PI', 'GP', 'CM', '--'].includes(status)) {
                return res.status(400).json({
                    error: 'Status inválido. Use: OK, NC_A, NC_B, PI, GP, CM, --'
                });
            }
            const review = await AuditDocumentReviewService_1.auditDocumentReviewService.updateDocumentStatus(id, clause, status, observations);
            if (!review) {
                return res.status(404).json({ error: 'Revisão de documentação não encontrada' });
            }
            return res.json(review);
        }
        catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
    /**
     * Adicionar documento à revisão
     * POST /api/internal-audit/document-review/:id/document
     */
    async addDocument(req, res) {
        try {
            const { id } = req.params;
            const { clause, requirement, status, observations, reviewer, reviewDate, documentId, documentName } = req.body;
            if (!id) {
                return res.status(400).json({ error: 'ID é obrigatório' });
            }
            if (!clause || !requirement || !reviewer) {
                return res.status(400).json({ error: 'Clause, requirement e reviewer são obrigatórios' });
            }
            const review = await AuditDocumentReviewService_1.auditDocumentReviewService.addDocument(id, {
                clause,
                requirement,
                status: status || '--',
                observations: observations || '',
                reviewer,
                reviewDate: reviewDate ? new Date(reviewDate) : new Date(),
                documentId,
                documentName,
            });
            if (!review) {
                return res.status(404).json({ error: 'Revisão de documentação não encontrada' });
            }
            return res.json(review);
        }
        catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
    /**
     * Remover documento da revisão
     * DELETE /api/internal-audit/document-review/:id/document/:clause
     */
    async removeDocument(req, res) {
        try {
            const { id, clause } = req.params;
            if (!id) {
                return res.status(400).json({ error: 'ID é obrigatório' });
            }
            if (!clause) {
                return res.status(400).json({ error: 'Cláusula é obrigatória' });
            }
            const review = await AuditDocumentReviewService_1.auditDocumentReviewService.removeDocument(id, clause);
            if (!review) {
                return res.status(404).json({ error: 'Revisão de documentação não encontrada' });
            }
            return res.json({ message: 'Documento removido com sucesso' });
        }
        catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
    /**
     * Finalizar revisão
     * POST /api/internal-audit/document-review/:id/complete
     */
    async completeReview(req, res) {
        try {
            const { id } = req.params;
            const { observations } = req.body;
            const userId = req.user?._id?.toString();
            if (!userId) {
                return res.status(401).json({ error: 'Usuário não autenticado' });
            }
            if (!id) {
                return res.status(400).json({ error: 'ID é obrigatório' });
            }
            const review = await AuditDocumentReviewService_1.auditDocumentReviewService.completeReview(id, userId, observations);
            if (!review) {
                return res.status(404).json({ error: 'Revisão de documentação não encontrada' });
            }
            return res.json(review);
        }
        catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
    /**
     * Excluir revisão
     * DELETE /api/internal-audit/document-review/:id
     */
    async delete(req, res) {
        try {
            const { id } = req.params;
            if (!id) {
                return res.status(400).json({ error: 'ID é obrigatório' });
            }
            const review = await AuditDocumentReviewService_1.auditDocumentReviewService.delete(id);
            if (!review) {
                return res.status(404).json({ error: 'Revisão de documentação não encontrada' });
            }
            return res.json({ message: 'Revisão excluída com sucesso' });
        }
        catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
    /**
     * Obter resumo da revisão
     * GET /api/internal-audit/document-review/:id/summary
     */
    async getSummary(req, res) {
        try {
            const { id } = req.params;
            if (!id) {
                return res.status(400).json({ error: 'ID é obrigatório' });
            }
            const summary = await AuditDocumentReviewService_1.auditDocumentReviewService.getSummary(id);
            if (!summary) {
                return res.status(404).json({ error: 'Revisão de documentação não encontrada' });
            }
            return res.json(summary);
        }
        catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
    /**
     * Obter não conformidades da revisão
     * GET /api/internal-audit/document-review/:id/nonconformities
     */
    async getNonconformities(req, res) {
        try {
            const { id } = req.params;
            if (!id) {
                return res.status(400).json({ error: 'ID é obrigatório' });
            }
            const nonconformities = await AuditDocumentReviewService_1.auditDocumentReviewService.getNonconformities(id);
            if (!nonconformities) {
                return res.status(404).json({ error: 'Revisão de documentação não encontrada' });
            }
            return res.json(nonconformities);
        }
        catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
    /**
     * Obter recomendações da revisão
     * GET /api/internal-audit/document-review/:id/recommendations
     */
    async getRecommendations(req, res) {
        try {
            const { id } = req.params;
            if (!id) {
                return res.status(400).json({ error: 'ID é obrigatório' });
            }
            const recommendations = await AuditDocumentReviewService_1.auditDocumentReviewService.getRecommendations(id);
            if (!recommendations) {
                return res.status(404).json({ error: 'Revisão de documentação não encontrada' });
            }
            return res.json(recommendations);
        }
        catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
}
exports.AuditDocumentReviewController = AuditDocumentReviewController;
exports.auditDocumentReviewController = new AuditDocumentReviewController();
//# sourceMappingURL=AuditDocumentReviewController.js.map