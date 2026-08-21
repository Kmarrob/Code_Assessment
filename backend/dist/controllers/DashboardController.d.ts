import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/index.js';
export declare class DashboardController {
    /**
     * Obter dados de maturidade da empresa do preposto
     */
    static getRepDashboard(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Obter dados de maturidade de uma empresa (Admin)
     */
    static getAdminCompanyDashboard(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Listar todas as empresas com resumo (Admin)
     */
    static listCompaniesSummary(_req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * 🔴 NOVO: Gerar PDF do Dashboard de Maturidade
     * GET /api/rep/dashboard/:companyId/pdf
     * Acesso: REP ou ADMIN
     */
    static generateDashboardPDF(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * 🔴 NOVO: Gerar PDF apenas da seção de Categorização
     * GET /api/rep/dashboard/:companyId/pdf/categorization
     * Acesso: REP ou ADMIN
     */
    static generateCategorizationPDF(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * 🔴 NOVO: Gerar PDF apenas da seção de Tipos de Controle
     * GET /api/rep/dashboard/:companyId/pdf/control-types
     * Acesso: REP ou ADMIN
     */
    static generateControlTypesPDF(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * 🔴 NOVO: Gerar PDF apenas da seção de Conceitos Cibernéticos
     * GET /api/rep/dashboard/:companyId/pdf/cyber-concepts
     * Acesso: REP ou ADMIN
     */
    static generateCyberConceptsPDF(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * 🔴 NOVO: Gerar PDF apenas da seção de Capacidades Operacionais
     * GET /api/rep/dashboard/:companyId/pdf/capabilities
     * Acesso: REP ou ADMIN
     */
    static generateCapabilitiesPDF(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * 🔴 NOVO: Gerar PDF apenas da seção de Domínios
     * GET /api/rep/dashboard/:companyId/pdf/domains
     * Acesso: REP ou ADMIN
     */
    static generateDomainsPDF(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * GET /api/dashboard/critical-controls
     * Busca controles com maturidade Nível 0 ou 1 para priorizar na auditoria
     *
     * Esta rota é utilizada pelo módulo de auditoria para:
     * - Alertar o REP sobre controles críticos
     * - Pré-selecionar controles para novos planos de auditoria
     * - Gerar recomendações automáticas de escopo
     *
     * Acesso: REP ou ADMIN
     */
    static getCriticalControls(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
}
//# sourceMappingURL=DashboardController.d.ts.map