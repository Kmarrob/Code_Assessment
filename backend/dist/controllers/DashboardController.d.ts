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
}
//# sourceMappingURL=DashboardController.d.ts.map