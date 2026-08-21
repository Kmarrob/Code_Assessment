import { Response } from 'express';
import { AuthenticatedRequest } from '../../types';
export declare class AuditDocumentReviewController {
    /**
     * Criar nova revisão de documentação
     * POST /api/internal-audit/document-review
     */
    create(req: AuthenticatedRequest, res: Response): Promise<Response>;
    /**
     * Buscar revisão por ID
     * GET /api/internal-audit/document-review/:id
     */
    findById(req: AuthenticatedRequest, res: Response): Promise<Response>;
    /**
     * Buscar revisão por plano de auditoria
     * GET /api/internal-audit/document-review/plan/:auditPlanId
     */
    findByAuditPlanId(req: AuthenticatedRequest, res: Response): Promise<Response>;
    /**
     * Buscar revisões por empresa
     * GET /api/internal-audit/document-review/company/:companyId
     */
    findAllByCompany(req: AuthenticatedRequest, res: Response): Promise<Response>;
    /**
     * Atualizar revisão
     * PUT /api/internal-audit/document-review/:id
     */
    update(req: AuthenticatedRequest, res: Response): Promise<Response>;
    /**
     * Atualizar um documento específico da revisão
     * PUT /api/internal-audit/document-review/:id/document/:clause
     */
    updateDocument(req: AuthenticatedRequest, res: Response): Promise<Response>;
    /**
     * Atualizar status de um documento
     * PUT /api/internal-audit/document-review/:id/document/:clause/status
     */
    updateDocumentStatus(req: AuthenticatedRequest, res: Response): Promise<Response>;
    /**
     * Adicionar documento à revisão
     * POST /api/internal-audit/document-review/:id/document
     */
    addDocument(req: AuthenticatedRequest, res: Response): Promise<Response>;
    /**
     * Remover documento da revisão
     * DELETE /api/internal-audit/document-review/:id/document/:clause
     */
    removeDocument(req: AuthenticatedRequest, res: Response): Promise<Response>;
    /**
     * Finalizar revisão
     * POST /api/internal-audit/document-review/:id/complete
     */
    completeReview(req: AuthenticatedRequest, res: Response): Promise<Response>;
    /**
     * Excluir revisão
     * DELETE /api/internal-audit/document-review/:id
     */
    delete(req: AuthenticatedRequest, res: Response): Promise<Response>;
    /**
     * Obter resumo da revisão
     * GET /api/internal-audit/document-review/:id/summary
     */
    getSummary(req: AuthenticatedRequest, res: Response): Promise<Response>;
    /**
     * Obter não conformidades da revisão
     * GET /api/internal-audit/document-review/:id/nonconformities
     */
    getNonconformities(req: AuthenticatedRequest, res: Response): Promise<Response>;
    /**
     * Obter recomendações da revisão
     * GET /api/internal-audit/document-review/:id/recommendations
     */
    getRecommendations(req: AuthenticatedRequest, res: Response): Promise<Response>;
}
export declare const auditDocumentReviewController: AuditDocumentReviewController;
//# sourceMappingURL=AuditDocumentReviewController.d.ts.map