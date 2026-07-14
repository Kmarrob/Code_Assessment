import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/index.js';
export declare class SubscriptionController {
    /**
     * Criar nova assinatura (self-service)
     * POST /api/subscriptions
     * Acesso: REP (da empresa) ou ADMIN
     */
    static createSubscription(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Obter assinatura ativa da empresa
     * GET /api/subscriptions/active
     * Acesso: REP (da empresa) ou ADMIN
     */
    static getActiveSubscription(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Obter histórico de assinaturas da empresa
     * GET /api/subscriptions/history
     * Acesso: REP (da empresa) ou ADMIN
     */
    static getSubscriptionHistory(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Verificar status da assinatura
     * GET /api/subscriptions/status
     * Acesso: REP (da empresa) ou ADMIN
     */
    static checkStatus(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Atualizar assinatura
     * PUT /api/subscriptions/:id
     * Acesso: ADMIN
     */
    static updateSubscription(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Cancelar assinatura
     * POST /api/subscriptions/:id/cancel
     * Acesso: ADMIN ou REP da empresa
     */
    static cancelSubscription(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Obter métricas de assinaturas (admin)
     * GET /api/admin/subscriptions/metrics
     * Acesso: ADMIN
     */
    static getMetrics(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
}
//# sourceMappingURL=SubscriptionController.d.ts.map