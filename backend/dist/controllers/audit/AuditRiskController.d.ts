import { Response } from 'express';
import { AuthenticatedRequest } from '../../types';
export declare class AuditRiskController {
    constructor();
    /**
     * ============================================================
     * OBTÉM O COMPANY ID DO USUÁRIO AUTENTICADO
     * ============================================================
     *
     * Regra:
     *
     * - Usuários vinculados a empresa:
     *   sempre utilizam req.user.companyId.
     *
     * - ADMIN:
     *   pode operar sobre uma empresa informada explicitamente,
     *   caso a arquitetura atual permita administração global.
     *
     * Para usuários comuns, companyId enviado pelo frontend
     * nunca deve substituir o companyId da sessão.
     */
    private getAuthenticatedCompanyId;
    /**
     * Verifica se o usuário pode operar sobre determinada empresa.
     *
     * ADMIN é tratado como usuário de plataforma.
     *
     * Para qualquer outro perfil, o companyId deve ser exatamente
     * igual ao companyId presente no token/sessão.
     */
    private canAccessCompany;
    /**
     * Obtém o tenant efetivo.
     *
     * Para usuários comuns:
     *   tenant = empresa da sessão.
     *
     * Para ADMIN:
     *   pode utilizar companyId fornecido na requisição.
     */
    private resolveCompanyId;
    /**
     * ============================================================
     * CRIAR NOVO RISCO
     * POST /api/internal-audit/risks
     * ============================================================
     */
    create(req: AuthenticatedRequest, res: Response): Promise<Response>;
    /**
     * ============================================================
     * BUSCAR RISCO POR ID
     * GET /api/internal-audit/risks/:id
     * ============================================================
     */
    findById(req: AuthenticatedRequest, res: Response): Promise<Response>;
    /**
     * ============================================================
     * BUSCAR RISCO PELO ID FUNCIONAL
     * GET /risks/company/:companyId/risk-id/:riskId
     * ============================================================
     */
    findByRiskId(req: AuthenticatedRequest, res: Response): Promise<Response>;
    /**
     * ============================================================
     * LISTAR RISCOS DE UMA EMPRESA
     * GET /risks/company/:companyId
     * ============================================================
     */
    /**
     * ============================================================
     * LISTAR RISCOS DE UM PLANO DE AUDITORIA
     * GET /risks/plan/:planId
     * ============================================================
     */
    findAllByPlan(req: AuthenticatedRequest, res: Response): Promise<Response>;
    findAllByCompany(req: AuthenticatedRequest, res: Response): Promise<Response>;
    /**
     * ============================================================
     * ATUALIZAR RISCO
     * PUT /api/internal-audit/risks/:id
     * ============================================================
     */
    update(req: AuthenticatedRequest, res: Response): Promise<Response>;
    /**
     * ============================================================
     * ATUALIZAR AVALIAÇÃO
     * PUT /risks/:id/assessment
     * ============================================================
     */
    updateAssessment(req: AuthenticatedRequest, res: Response): Promise<Response>;
    /**
     * ============================================================
     * TRATAR RISCO
     * POST /risks/:id/treat
     * ============================================================
     */
    treatRisk(req: AuthenticatedRequest, res: Response): Promise<Response>;
    /**
     * ============================================================
     * MONITORAR RISCO
     * PUT /risks/:id/monitor
     * ============================================================
     */
    monitorRisk(req: AuthenticatedRequest, res: Response): Promise<Response>;
    /**
     * ============================================================
     * REABRIR RISCO
     * POST /risks/:id/reopen
     * ============================================================
     */
    reopenRisk(req: AuthenticatedRequest, res: Response): Promise<Response>;
    /**
     * ============================================================
     * EXCLUIR RISCO
     * DELETE /risks/:id
     * ============================================================
     */
    delete(req: AuthenticatedRequest, res: Response): Promise<Response>;
    /**
     * ============================================================
     * ESTATÍSTICAS
     * GET /risks/company/:companyId/stats
     * ============================================================
     */
    getStatistics(req: AuthenticatedRequest, res: Response): Promise<Response>;
    /**
     * ============================================================
     * RISCOS CRÍTICOS
     * GET /risks/company/:companyId/critical
     * ============================================================
     */
    getCriticalRisks(req: AuthenticatedRequest, res: Response): Promise<Response>;
    /**
     * ============================================================
     * EXPORTAR RISCOS
     * GET /risks/company/:companyId/export
     * ============================================================
     */
    exportToSpreadsheet(req: AuthenticatedRequest, res: Response): Promise<Response>;
}
export declare const auditRiskController: AuditRiskController;
//# sourceMappingURL=AuditRiskController.d.ts.map