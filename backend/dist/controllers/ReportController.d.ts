import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/index.js';
export declare class ReportController {
    /**
     * Obter ou criar relatório de uma empresa
     * GET /api/reports/company/:companyId
     * Acesso: REP (da empresa) ou ADMIN
     */
    static getReportByCompany(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Gerar dados automáticos do relatório
     * POST /api/reports/company/:companyId/generate
     * Acesso: REP (da empresa) ou ADMIN
     */
    static generateReport(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Atualizar relatório (campos editáveis)
     * PUT /api/reports/company/:companyId
     * Acesso: ADMIN (também REP com permissão)
     */
    static updateReport(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Listar todos os relatórios (apenas ADMIN)
     * GET /api/reports
     * Acesso: ADMIN
     */
    static listReports(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Obter dashboard do relatório com resumo (para preposto)
     * GET /api/reports/dashboard
     * Acesso: REP
     */
    static getReportDashboard(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
}
//# sourceMappingURL=ReportController.d.ts.map