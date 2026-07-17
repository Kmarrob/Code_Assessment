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
    /**
     * 🔴 NOVO: Obter dashboard do relatório por nome da empresa
     * GET /api/reports/dashboard/company/:companyName
     * Acesso: REP ou ADMIN
     */
    static getReportDashboardByCompanyName(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * 🔴 NOVO: Obter dashboard completo do relatório para ADMIN (com companyId)
     * GET /api/reports/admin/dashboard/:companyId
     * Acesso: ADMIN
     */
    static getAdminDashboardByCompany(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * 🔴 NOVO: Obter dados para a Matriz de Priorização
     * GET /api/reports/priorization/:companyId
     * Acesso: ADMIN ou REP (da empresa)
     */
    static getPriorizationMatrix(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * 🔴 NOVO: Obter Roadmap de Implementação
     * GET /api/reports/roadmap/:companyId
     * Acesso: ADMIN ou REP (da empresa)
     */
    static getRoadmap(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * 🔴 NOVO: Gerar PDF do relatório
     * GET /api/reports/:companyId/pdf
     * Acesso: ADMIN ou REP (da empresa)
     */
    static generatePDF(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
}
//# sourceMappingURL=ReportController.d.ts.map