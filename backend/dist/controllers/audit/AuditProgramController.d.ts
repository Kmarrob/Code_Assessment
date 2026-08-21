import { Response } from 'express';
import { AuthenticatedRequest } from '../../types';
export declare class AuditProgramController {
    /**
     * Criar novo programa de auditorias
     * POST /api/internal-audit/program
     */
    create(req: AuthenticatedRequest, res: Response): Promise<Response>;
    /**
     * Buscar programa por ID
     * GET /api/internal-audit/program/:id
     */
    findById(req: AuthenticatedRequest, res: Response): Promise<Response>;
    /**
     * Buscar programa por empresa e ano
     * GET /api/internal-audit/program/company/:companyId/year/:year
     */
    findByCompanyAndYear(req: AuthenticatedRequest, res: Response): Promise<Response>;
    /**
     * Listar programas de uma empresa
     * GET /api/internal-audit/program/company/:companyId
     */
    findAllByCompany(req: AuthenticatedRequest, res: Response): Promise<Response>;
    /**
     * Atualizar programa
     * PUT /api/internal-audit/program/:id
     */
    update(req: AuthenticatedRequest, res: Response): Promise<Response>;
    /**
     * Aprovar programa
     * POST /api/internal-audit/program/:id/approve   */
    approve(req: AuthenticatedRequest, res: Response): Promise<Response>;
    /**
     * Ativar programa
     * POST /api/internal-audit/program/:id/activate
     */
    activate(req: AuthenticatedRequest, res: Response): Promise<Response>;
    /**
     * Arquivar programa
     * POST /api/internal-audit/program/:id/archive
     */
    archive(req: AuthenticatedRequest, res: Response): Promise<Response>;
    /**
     * Adicionar setor ao programa
     * POST /api/internal-audit/program/:id/sector
     */
    addSector(req: AuthenticatedRequest, res: Response): Promise<Response>;
    /**
     * Atualizar setor do programa
     * PUT /api/internal-audit/program/:id/sector/:index
     */
    updateSector(req: AuthenticatedRequest, res: Response): Promise<Response>;
    /**
     * Adicionar auditoria de fornecedor
     * POST /api/internal-audit/program/:id/supplier-audit
     */
    addSupplierAudit(req: AuthenticatedRequest, res: Response): Promise<Response>;
    /**
     * Atualizar auditoria de fornecedor
     * PUT /api/internal-audit/program/:id/supplier-audit/:index
     */
    updateSupplierAudit(req: AuthenticatedRequest, res: Response): Promise<Response>;
    /**
     * Atualizar auditoria externa
     * PUT /api/internal-audit/program/:id/external-audit
     */
    updateExternalAudit(req: AuthenticatedRequest, res: Response): Promise<Response>;
    /**
     * Adicionar atividade ao programa
     * POST /api/internal-audit/program/:id/activity
     */
    addActivity(req: AuthenticatedRequest, res: Response): Promise<Response>;
    /**
     * Atualizar atividade
     * PUT /api/internal-audit/program/:id/activity/:index
     */
    updateActivity(req: AuthenticatedRequest, res: Response): Promise<Response>;
    /**
     * Excluir programa
     * DELETE /api/internal-audit/program/:id
     */
    delete(req: AuthenticatedRequest, res: Response): Promise<Response>;
    /**
     * Obter estatísticas do programa
     * GET /api/internal-audit/program/:id/stats
     */
    getStatistics(req: AuthenticatedRequest, res: Response): Promise<Response>;
    /**
     * Gerar próximas auditorias
     * GET /api/internal-audit/program/:id/next-audits
     */
    generateNextAudits(req: AuthenticatedRequest, res: Response): Promise<Response>;
}
export declare const auditProgramController: AuditProgramController;
//# sourceMappingURL=AuditProgramController.d.ts.map