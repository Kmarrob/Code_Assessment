"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.funnelAnalyticsController = exports.FunnelAnalyticsController = void 0;
const zod_1 = require("zod");
const RevenueAnalyticsService_js_1 = require("../services/RevenueAnalyticsService.js");
const FunnelAnalyticsService_js_1 = require("../services/FunnelAnalyticsService.js");
const ChurnAnalyticsService_js_1 = require("../services/ChurnAnalyticsService.js");
// ============================================
// SCHEMAS DE VALIDAÇÃO
// ============================================
const periodSchema = zod_1.z.object({
    period: zod_1.z.enum(['30d', '90d', 'custom']).default('30d'),
    startDate: zod_1.z.string().datetime().optional(),
    endDate: zod_1.z.string().datetime().optional()
});
const clientListSchema = periodSchema.extend({
    plan: zod_1.z.string().optional(),
    status: zod_1.z.string().optional(),
    search: zod_1.z.string().optional(),
    limit: zod_1.z.coerce.number().min(1).max(100).default(20),
    offset: zod_1.z.coerce.number().min(0).default(0)
});
// ============================================
// UTILITÁRIOS
// ============================================
/**
 * Converte período para datas
 */
function parsePeriod(period, startDateStr, endDateStr) {
    const now = new Date();
    let startDate = new Date(now);
    let endDate = new Date(now);
    if (period === 'custom' && startDateStr && endDateStr) {
        startDate = new Date(startDateStr);
        endDate = new Date(endDateStr);
        return {
            startDate,
            endDate,
            label: `${startDate.toLocaleDateString('pt-BR')} - ${endDate.toLocaleDateString('pt-BR')}`
        };
    }
    const days = period === '30d' ? 30 : 90;
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);
    return {
        startDate,
        endDate,
        label: `Últimos ${days} dias`
    };
}
/**
 * Converte status string para enum
 */
function parseStatus(status) {
    if (!status)
        return undefined;
    const validStatuses = [
        'registered', 'trialing', 'trial_expired', 'converted',
        'active', 'past_due', 'cancelled', 'churned'
    ];
    return validStatuses.includes(status)
        ? status
        : undefined;
}
// ============================================
// CONTROLLER
// ============================================
class FunnelAnalyticsController {
    /**
     * GET /api/admin/analytics/summary
     * Resumo completo do dashboard de analytics
     */
    async getSummary(req, res, next) {
        try {
            const { period, startDate, endDate } = periodSchema.parse(req.query);
            const { startDate: start, endDate: end, label } = parsePeriod(period, startDate, endDate);
            console.log('📊 Buscando resumo de analytics', { period, label });
            // Buscar métricas em paralelo
            const [revenue, funnel, churn, statusDistribution, planDistribution, recentClients] = await Promise.all([
                RevenueAnalyticsService_js_1.revenueAnalyticsService.getRevenueMetrics(start, end),
                FunnelAnalyticsService_js_1.funnelAnalyticsService.getFunnelMetrics(start, end),
                ChurnAnalyticsService_js_1.churnAnalyticsService.getChurnMetrics(start, end),
                FunnelAnalyticsService_js_1.funnelAnalyticsService.getStatusDistribution(start, end),
                this.getPlanDistribution(),
                FunnelAnalyticsService_js_1.funnelAnalyticsService.getClientList(start, end, { limit: 10 })
            ]);
            const recentClientsData = (recentClients && typeof recentClients === 'object' && 'clients' in recentClients)
                ? recentClients.clients
                : [];
            res.json({
                success: true,
                data: {
                    revenue,
                    funnel,
                    churn,
                    planDistribution,
                    statusDistribution,
                    recentClients: recentClientsData,
                    period: {
                        startDate: start,
                        endDate: end,
                        label,
                        type: period
                    },
                    generatedAt: new Date()
                },
                statusCode: 200
            });
        }
        catch (error) {
            console.error('❌ Erro ao buscar resumo de analytics:', error);
            res.status(500).json({
                success: false,
                message: error?.message || 'Erro ao buscar resumo de analytics',
                code: 'UNKNOWN_ERROR',
                statusCode: 500,
                timestamp: new Date().toISOString(),
                path: '/api/admin/analytics/summary'
            });
        }
    }
    /**
     * GET /api/admin/analytics/revenue
     * Métricas de receita
     */
    async getRevenue(req, res, next) {
        try {
            const { period, startDate, endDate } = periodSchema.parse(req.query);
            const { startDate: start, endDate: end } = parsePeriod(period, startDate, endDate);
            const revenue = await RevenueAnalyticsService_js_1.revenueAnalyticsService.getRevenueMetrics(start, end);
            res.json({
                success: true,
                data: revenue,
                statusCode: 200
            });
        }
        catch (error) {
            console.error('❌ Erro ao buscar métricas de receita:', error);
            res.status(500).json({
                success: false,
                message: error?.message || 'Erro ao buscar métricas de receita',
                code: 'UNKNOWN_ERROR',
                statusCode: 500
            });
        }
    }
    /**
     * GET /api/admin/analytics/funnel
     * Métricas do funil de conversão
     */
    async getFunnel(req, res, next) {
        try {
            const { period, startDate, endDate } = periodSchema.parse(req.query);
            const { startDate: start, endDate: end } = parsePeriod(period, startDate, endDate);
            const funnel = await FunnelAnalyticsService_js_1.funnelAnalyticsService.getFunnelDetails(start, end);
            res.json({
                success: true,
                data: funnel,
                statusCode: 200
            });
        }
        catch (error) {
            console.error('❌ Erro ao buscar métricas do funil:', error);
            res.status(500).json({
                success: false,
                message: error?.message || 'Erro ao buscar métricas do funil',
                code: 'UNKNOWN_ERROR',
                statusCode: 500
            });
        }
    }
    /**
     * GET /api/admin/analytics/churn
     * Métricas de churn
     */
    async getChurn(req, res, next) {
        try {
            const { period, startDate, endDate } = periodSchema.parse(req.query);
            const { startDate: start, endDate: end } = parsePeriod(period, startDate, endDate);
            const churn = await ChurnAnalyticsService_js_1.churnAnalyticsService.getChurnMetrics(start, end);
            res.json({
                success: true,
                data: churn,
                statusCode: 200
            });
        }
        catch (error) {
            console.error('❌ Erro ao buscar métricas de churn:', error);
            res.status(500).json({
                success: false,
                message: error?.message || 'Erro ao buscar métricas de churn',
                code: 'UNKNOWN_ERROR',
                statusCode: 500
            });
        }
    }
    /**
     * GET /api/admin/analytics/plans
     * Distribuição por plano
     */
    async getPlans(req, res, next) {
        try {
            const distribution = await this.getPlanDistribution();
            res.json({
                success: true,
                data: distribution,
                statusCode: 200
            });
        }
        catch (error) {
            console.error('❌ Erro ao buscar distribuição por plano:', error);
            res.status(500).json({
                success: false,
                message: error?.message || 'Erro ao buscar distribuição por plano',
                code: 'UNKNOWN_ERROR',
                statusCode: 500
            });
        }
    }
    /**
     * GET /api/admin/analytics/clients
     * Lista de clientes com status
     */
    async getClients(req, res, next) {
        try {
            const { period, startDate, endDate, plan, status, search, limit, offset } = clientListSchema.parse(req.query);
            const { startDate: start, endDate: end } = parsePeriod(period, startDate, endDate);
            const result = await FunnelAnalyticsService_js_1.funnelAnalyticsService.getClientList(start, end, {
                plan: plan,
                status: parseStatus(status),
                search: search,
                limit,
                offset
            });
            res.json({
                success: true,
                data: result,
                statusCode: 200
            });
        }
        catch (error) {
            console.error('❌ Erro ao buscar lista de clientes:', error);
            res.status(500).json({
                success: false,
                message: error?.message || 'Erro ao buscar lista de clientes',
                code: 'UNKNOWN_ERROR',
                statusCode: 500
            });
        }
    }
    /**
     * GET /api/admin/analytics/retention
     * Curva de retenção
     */
    async getRetention(req, res, next) {
        try {
            const { period, startDate, endDate } = periodSchema.parse(req.query);
            const maxMonths = req.query.maxMonths ? parseInt(req.query.maxMonths) : 12;
            const { startDate: start, endDate: end } = parsePeriod(period, startDate, endDate);
            const retention = await ChurnAnalyticsService_js_1.churnAnalyticsService.getRetentionCurve(start, end, Math.min(maxMonths, 24));
            res.json({
                success: true,
                data: retention,
                statusCode: 200
            });
        }
        catch (error) {
            console.error('❌ Erro ao buscar curva de retenção:', error);
            res.status(500).json({
                success: false,
                message: error?.message || 'Erro ao buscar curva de retenção',
                code: 'UNKNOWN_ERROR',
                statusCode: 500
            });
        }
    }
    /**
     * GET /api/admin/analytics/prediction
     * Predição de churn
     */
    async getPrediction(req, res, next) {
        try {
            const prediction = await ChurnAnalyticsService_js_1.churnAnalyticsService.getChurnPrediction();
            res.json({
                success: true,
                data: prediction,
                statusCode: 200
            });
        }
        catch (error) {
            console.error('❌ Erro ao buscar predição de churn:', error);
            res.status(500).json({
                success: false,
                message: error?.message || 'Erro ao buscar predição de churn',
                code: 'UNKNOWN_ERROR',
                statusCode: 500
            });
        }
    }
    /**
     * GET /api/admin/analytics/strategies
     * Estratégias de retenção
     */
    async getStrategies(req, res, next) {
        try {
            const { period, startDate, endDate } = periodSchema.parse(req.query);
            const { startDate: start, endDate: end } = parsePeriod(period, startDate, endDate);
            const strategies = await ChurnAnalyticsService_js_1.churnAnalyticsService.getRetentionStrategies(start, end);
            res.json({
                success: true,
                data: strategies,
                statusCode: 200
            });
        }
        catch (error) {
            console.error('❌ Erro ao buscar estratégias de retenção:', error);
            res.status(500).json({
                success: false,
                message: error?.message || 'Erro ao buscar estratégias de retenção',
                code: 'UNKNOWN_ERROR',
                statusCode: 500
            });
        }
    }
    /**
     * GET /api/admin/analytics/abandoned
     * Trials abandonados
     */
    async getAbandonedTrials(req, res, next) {
        try {
            const { period, startDate, endDate } = periodSchema.parse(req.query);
            const { startDate: start, endDate: end } = parsePeriod(period, startDate, endDate);
            const abandoned = await FunnelAnalyticsService_js_1.funnelAnalyticsService.getAbandonedTrials(start, end);
            res.json({
                success: true,
                data: abandoned,
                statusCode: 200
            });
        }
        catch (error) {
            console.error('❌ Erro ao buscar trials abandonados:', error);
            res.status(500).json({
                success: false,
                message: error?.message || 'Erro ao buscar trials abandonados',
                code: 'UNKNOWN_ERROR',
                statusCode: 500
            });
        }
    }
    /**
     * GET /api/admin/analytics/trend
     * Tendência de conversão
     */
    async getTrend(req, res, next) {
        try {
            const { period, startDate, endDate } = periodSchema.parse(req.query);
            const interval = req.query.interval || 'weekly';
            const { startDate: start, endDate: end } = parsePeriod(period, startDate, endDate);
            const trend = await FunnelAnalyticsService_js_1.funnelAnalyticsService.getConversionTrend(start, end, interval);
            res.json({
                success: true,
                data: trend,
                statusCode: 200
            });
        }
        catch (error) {
            console.error('❌ Erro ao buscar tendência de conversão:', error);
            res.status(500).json({
                success: false,
                message: error?.message || 'Erro ao buscar tendência de conversão',
                code: 'UNKNOWN_ERROR',
                statusCode: 500
            });
        }
    }
    // ============================================
    // MÉTODOS PRIVADOS
    // ============================================
    /**
     * Obtém distribuição por plano
     */
    async getPlanDistribution() {
        try {
            const Subscription = require('../models/Subscription.js').default;
            const result = await Subscription.aggregate([
                {
                    $match: {
                        status: { $in: ['active', 'trialing'] }
                    }
                },
                {
                    $lookup: {
                        from: 'plans',
                        localField: 'planId',
                        foreignField: '_id',
                        as: 'plan'
                    }
                },
                {
                    $unwind: '$plan'
                },
                {
                    $group: {
                        _id: '$plan.name',
                        count: { $sum: 1 }
                    }
                }
            ]);
            const total = result.reduce((sum, item) => sum + item.count, 0);
            return result.map((item) => ({
                planName: item._id,
                count: item.count,
                percentage: total > 0 ? (item.count / total) * 100 : 0
            }));
        }
        catch (error) {
            console.error('❌ Erro ao calcular distribuição por plano:', error);
            return [];
        }
    }
}
exports.FunnelAnalyticsController = FunnelAnalyticsController;
/**
 * Instância única do controller (singleton)
 */
exports.funnelAnalyticsController = new FunnelAnalyticsController();
exports.default = exports.funnelAnalyticsController;
//# sourceMappingURL=FunnelAnalyticsController.js.map