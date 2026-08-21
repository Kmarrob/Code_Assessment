import { Response } from 'express';
import { AuthenticatedRequest } from '../../types';
export declare class AuditRiskController {
    /**
     * Criar novo risco
     * POST /api/internal-audit/risks
     */
    create(req: AuthenticatedRequest, res: Response): Promise<Response>;
    /**
     * Buscar risco por ID
     * GET /api/internal-audit/risks/:id
     */
    findById(req: AuthenticatedRequest, res: Response): Promise<Response>;
    /**
     * Buscar risco por ID (identificador único)
     * GET /api/internal-audit/risks/company/:companyId/risk-id/:riskId
     */
    findByRiskId(req: AuthenticatedRequest, res: Response): Promise<Response>;
    /**
     * Listar riscos de uma empresa
     * GET /api/internal-audit/risks/company/:companyId
     */
    findAllByCompany(req: AuthenticatedRequest, res: Response): Promise<Response>;
    /**
     * Atualizar risco
     * PUT /api/internal-audit/risks/:id
     */
    update(req: AuthenticatedRequest, res: Response): Promise<Response>;
    /**
     * Atualizar avaliação do risco
     * PUT /api/internal-audit/risks/:id/assessment
     */
    updateAssessment(req: AuthenticatedRequest, res: Response): Promise<Response>;
    /**
     * Tratar risco
     * POST /api/internal-audit/risks/:id/treat
     */
    treatRisk(req: AuthenticatedRequest, res: Response): Promise<Response>;
    /**
     * Monitorar risco
     * PUT /api/internal-audit/risks/:id/monitor
     */
    monitorRisk(req: AuthenticatedRequest, res: Response): Promise<Response>;
    /**
     * Reabrir risco
     * POST /api/internal-audit/risks/:id/reopen
     */
    reopenRisk(req: AuthenticatedRequest, res: Response): Promise<Response>;
    /**
     * Excluir risco
     * DELETE /api/internal-audit/risks/:id
     */
    delete(req: AuthenticatedRequest, res: Response): Promise<Response>;
    /**
     * Obter estatísticas de riscos
     * GET /api/internal-audit/risks/company/:companyId/stats
     */
    getStatistics(req: AuthenticatedRequest, res: Response): Promise<Response>;
    /**
     * Obter riscos críticos
     * GET /api/internal-audit/risks/company/:companyId/critical
     */
    getCriticalRisks(req: AuthenticatedRequest, res: Response): Promise<Response>;
    /**
     * Exportar riscos para formato de planilha
     * GET /api/internal-audit/risks/company/:companyId/export
     */
    exportToSpreadsheet(req: AuthenticatedRequest, res: Response): Promise<Response>;
}
export declare const auditRiskController: AuditRiskController;
//# sourceMappingURL=AuditRiskController.d.ts.map