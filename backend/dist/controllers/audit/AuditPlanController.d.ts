import { Response } from 'express';
import { AuthenticatedRequest } from '../../types';
export declare class AuditPlanController {
    create(req: AuthenticatedRequest, res: Response): Promise<Response>;
    findAll(req: AuthenticatedRequest, res: Response): Promise<Response>;
    findById(req: AuthenticatedRequest, res: Response): Promise<Response>;
    update(req: AuthenticatedRequest, res: Response): Promise<Response>;
    delete(req: AuthenticatedRequest, res: Response): Promise<Response>;
    submitForApproval(req: AuthenticatedRequest, res: Response): Promise<Response>;
    approve(req: AuthenticatedRequest, res: Response): Promise<Response>;
    reject(req: AuthenticatedRequest, res: Response): Promise<Response>;
    cancel(req: AuthenticatedRequest, res: Response): Promise<Response>;
    startAudit(req: AuthenticatedRequest, res: Response): Promise<Response>;
    completeAudit(req: AuthenticatedRequest, res: Response): Promise<Response>;
    getStats(req: AuthenticatedRequest, res: Response): Promise<Response>;
    getResponsesByPlan(req: AuthenticatedRequest, res: Response): Promise<Response>;
    /**
     * Exclui um controle do escopo da auditoria.
     *
     * Rota esperada:
     *   POST /api/internal-audit/plans/:id/exclusions
     *
     * Body:
     *   {
     *     controlId: string,
     *     reason: string (min 20 chars)
     *   }
     *
     * Regras:
     *   - Plano deve estar em 'draft' ou 'pending_approval'.
     *   - Plano deve estar em modo 'all'.
     *   - Justificativa obrigatória.
     *   - Não pode excluir todos os controles.
     */
    excludeControl(req: AuthenticatedRequest, res: Response): Promise<Response>;
    /**
     * Aprova uma exclusão de controle previamente registrada.
     *
     * Rota esperada:
     *   POST /api/internal-audit/plans/:id/exclusions/:controlId/approve
     *
     * Regras:
     *   - Apenas o Auditor Líder pode aprovar.
     *   - A exclusão precisa existir.
     *   - A exclusão não pode já estar aprovada.
     */
    approveExclusion(req: AuthenticatedRequest, res: Response): Promise<Response>;
    /**
     * Rejeita uma exclusão de controle.
     *
     * Rota esperada:
     *   POST /api/internal-audit/plans/:id/exclusions/:controlId/reject
     *
     * Regras:
     *   - Apenas o Auditor Líder pode rejeitar.
     *   - Ao rejeitar, o controle volta ao escopo efetivo.
     */
    rejectExclusion(req: AuthenticatedRequest, res: Response): Promise<Response>;
    /**
     * Remove uma exclusão já registrada (sem rejeição formal).
     *
     * Rota esperada:
     *   DELETE /api/internal-audit/plans/:id/exclusions/:controlId
     *
     * Regras:
     *   - Plano deve estar em 'draft' ou 'pending_approval'.
     *   - Autor da exclusão OU Auditor Líder podem remover.
     *   - O controle volta ao escopo efetivo.
     */
    removeExclusion(req: AuthenticatedRequest, res: Response): Promise<Response>;
    getPlansToApprove(req: AuthenticatedRequest, res: Response): Promise<Response>;
    getLeadAuditorPlans(req: AuthenticatedRequest, res: Response): Promise<Response>;
    getAuditorPlans(req: AuthenticatedRequest, res: Response): Promise<Response>;
    getObserverPlans(req: AuthenticatedRequest, res: Response): Promise<Response>;
}
export declare const auditPlanController: AuditPlanController;
//# sourceMappingURL=AuditPlanController.d.ts.map