import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/index.js';
export declare class PlanController {
    /**
     * Listar todos os planos (admin)
     * GET /api/admin/plans
     */
    static listPlans(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Obter planos públicos (para página de planos)
     * GET /api/plans
     */
    static getPublicPlans(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Obter plano por ID
     * GET /api/admin/plans/:id
     */
    static getPlanById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Criar novo plano (admin)
     * POST /api/admin/plans
     */
    static createPlan(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Atualizar plano (admin)
     * PUT /api/admin/plans/:id
     */
    static updatePlan(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Deletar plano (admin) - apenas desativa
     * DELETE /api/admin/plans/:id
     */
    static deletePlan(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Calcular preço efetivo de um plano
     * GET /api/plans/:id/calculate?users=5&annual=true
     */
    static calculatePrice(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
}
//# sourceMappingURL=PlanController.d.ts.map