import { Response } from 'express';
import { AuthenticatedRequest } from '../../types';
export declare class AuditSoAController {
    /**
     * Criar nova Declaração de Aplicabilidade
     * POST /api/internal-audit/soa
     */
    create(req: AuthenticatedRequest, res: Response): Promise<Response>;
    /**
     * Buscar SoA por ID
     * GET /api/internal-audit/soa/:id
     */
    findById(req: AuthenticatedRequest, res: Response): Promise<Response>;
    /**
     * Buscar SoA por empresa
     * GET /api/internal-audit/soa/company/:companyId
     */
    findByCompany(req: AuthenticatedRequest, res: Response): Promise<Response>;
    /**
     * Buscar SoA ativa por empresa
     * GET /api/internal-audit/soa/company/:companyId/active
     */
    findActiveByCompany(req: AuthenticatedRequest, res: Response): Promise<Response>;
    /**
     * Atualizar SoA
     * PUT /api/internal-audit/soa/:id
     */
    update(req: AuthenticatedRequest, res: Response): Promise<Response>;
    /**
     * Atualizar um controle específico da SoA
     * PUT /api/internal-audit/soa/:id/control/:clause
     */
    updateControl(req: AuthenticatedRequest, res: Response): Promise<Response>;
    /**
     * Aprovar SoA
     * POST /api/internal-audit/soa/:id/approve
     */
    approve(req: AuthenticatedRequest, res: Response): Promise<Response>;
    /**
     * Arquivar SoA
     * POST /api/internal-audit/soa/:id/archive
     */
    archive(req: AuthenticatedRequest, res: Response): Promise<Response>;
    /**
     * Excluir SoA
     * DELETE /api/internal-audit/soa/:id
     */
    delete(req: AuthenticatedRequest, res: Response): Promise<Response>;
    /**
     * Obter estatísticas da SoA
     * GET /api/internal-audit/soa/:id/stats
     */
    getStatistics(req: AuthenticatedRequest, res: Response): Promise<Response>;
    /**
     * Exportar SoA para formato de planilha
     * GET /api/internal-audit/soa/:id/export
     */
    exportToSpreadsheet(req: AuthenticatedRequest, res: Response): Promise<Response>;
}
export declare const auditSoAController: AuditSoAController;
//# sourceMappingURL=AuditSoAController.d.ts.map