/**
 * ============================================
 * FUNNEL ANALYTICS CONTROLLER
 * ============================================
 *
 * Controlador responsável por expor os endpoints
 * do sistema de funil de conversão para o frontend.
 *
 * @module FunnelAnalyticsController
 * @since v30.0
 */
import { Request, Response, NextFunction } from 'express';
export declare class FunnelAnalyticsController {
    /**
     * GET /api/admin/analytics/summary
     * Resumo completo do dashboard de analytics
     */
    getSummary(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * GET /api/admin/analytics/revenue
     * Métricas de receita
     */
    getRevenue(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * GET /api/admin/analytics/funnel
     * Métricas do funil de conversão
     */
    getFunnel(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * GET /api/admin/analytics/churn
     * Métricas de churn
     */
    getChurn(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * GET /api/admin/analytics/plans
     * Distribuição por plano
     */
    getPlans(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * GET /api/admin/analytics/clients
     * Lista de clientes com status
     */
    getClients(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * GET /api/admin/analytics/retention
     * Curva de retenção
     */
    getRetention(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * GET /api/admin/analytics/prediction
     * Predição de churn
     */
    getPrediction(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * GET /api/admin/analytics/strategies
     * Estratégias de retenção
     */
    getStrategies(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * GET /api/admin/analytics/abandoned
     * Trials abandonados
     */
    getAbandonedTrials(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * GET /api/admin/analytics/trend
     * Tendência de conversão
     */
    getTrend(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * GET /api/admin/analytics/comparison
     * Comparação de métricas entre períodos
     */
    getComparison(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * GET /api/admin/analytics/forecast
     * Previsão de receita para os próximos meses
     */
    getForecast(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * GET /api/admin/analytics/clients/:clientId
     * Detalhamento completo de um cliente específico
     */
    getClientDetails(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * Obtém distribuição por plano
     */
    private getPlanDistribution;
}
/**
 * Instância única do controller (singleton)
 */
export declare const funnelAnalyticsController: FunnelAnalyticsController;
export default funnelAnalyticsController;
//# sourceMappingURL=FunnelAnalyticsController.d.ts.map