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
import { z } from 'zod';
import { revenueAnalyticsService } from '../services/RevenueAnalyticsService.js';
import { funnelAnalyticsService } from '../services/FunnelAnalyticsService.js';
import { churnAnalyticsService } from '../services/ChurnAnalyticsService.js';
import {
  AnalyticsPeriod,
  ClientFunnelStatus
} from '../types/analytics.types.js';

// ============================================
// SCHEMAS DE VALIDAÇÃO
// ============================================

const periodSchema = z.object({
  period: z.enum(['30d', '90d', 'custom']).default('30d'),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional()
});

const clientListSchema = periodSchema.extend({
  plan: z.string().optional(),
  status: z.string().optional(),
  search: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).default(20),
  offset: z.coerce.number().min(0).default(0)
});

// ============================================
// 🔴 NOVO: SCHEMA PARA COMPARAÇÃO DE PERÍODOS
// ============================================

const comparisonSchema = z.object({
  period: z.enum(['30d', '90d', 'custom']).default('30d'),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  compareWith: z.enum(['previous', 'same_period_last_year']).default('previous')
});

// ============================================
// 🔴 NOVO: SCHEMA PARA PREVISÃO
// ============================================

const forecastSchema = z.object({
  period: z.enum(['30d', '90d', 'custom']).default('90d'),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  monthsToForecast: z.coerce.number().min(1).max(24).default(12)
});

// ============================================
// UTILITÁRIOS
// ============================================

/**
 * Converte período para datas
 */
function parsePeriod(
  period: AnalyticsPeriod,
  startDateStr?: string,
  endDateStr?: string
): { startDate: Date; endDate: Date; label: string } {
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
function parseStatus(status?: string): ClientFunnelStatus | undefined {
  if (!status) return undefined;
  const validStatuses: ClientFunnelStatus[] = [
    'registered', 'trialing', 'trial_expired', 'converted',
    'active', 'past_due', 'cancelled', 'churned'
  ];
  return validStatuses.includes(status as ClientFunnelStatus)
    ? (status as ClientFunnelStatus)
    : undefined;
}

/**
 * 🔴 NOVO: Calcula período anterior para comparação
 */
function getPreviousPeriod(startDate: Date, endDate: Date): { startDate: Date; endDate: Date } {
  const duration = endDate.getTime() - startDate.getTime();
  const previousStart = new Date(startDate.getTime() - duration);
  const previousEnd = new Date(startDate.getTime());
  return { startDate: previousStart, endDate: previousEnd };
}

// ============================================
// CONTROLLER
// ============================================

export class FunnelAnalyticsController {
  /**
   * GET /api/admin/analytics/summary
   * Resumo completo do dashboard de analytics
   */
  async getSummary(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { period, startDate, endDate } = periodSchema.parse(req.query);

      const { startDate: start, endDate: end, label } = parsePeriod(
        period,
        startDate as string,
        endDate as string
      );

      console.log('📊 Buscando resumo de analytics', { period, label });

      // Buscar métricas em paralelo
      const [revenue, funnel, churn, statusDistribution, planDistribution, recentClients] =
        await Promise.all([
          revenueAnalyticsService.getRevenueMetrics(start, end),
          funnelAnalyticsService.getFunnelMetrics(start, end),
          churnAnalyticsService.getChurnMetrics(start, end),
          funnelAnalyticsService.getStatusDistribution(start, end),
          this.getPlanDistribution(),
          funnelAnalyticsService.getClientList(start, end, { limit: 10 })
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
    } catch (error: any) {
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
  async getRevenue(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { period, startDate, endDate } = periodSchema.parse(req.query);

      const { startDate: start, endDate: end } = parsePeriod(
        period,
        startDate as string,
        endDate as string
      );

      const revenue = await revenueAnalyticsService.getRevenueMetrics(start, end);

      res.json({
        success: true,
        data: revenue,
        statusCode: 200
      });
    } catch (error: any) {
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
  async getFunnel(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { period, startDate, endDate } = periodSchema.parse(req.query);

      const { startDate: start, endDate: end } = parsePeriod(
        period,
        startDate as string,
        endDate as string
      );

      const funnel = await funnelAnalyticsService.getFunnelDetails(start, end);

      res.json({
        success: true,
        data: funnel,
        statusCode: 200
      });
    } catch (error: any) {
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
  async getChurn(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { period, startDate, endDate } = periodSchema.parse(req.query);

      const { startDate: start, endDate: end } = parsePeriod(
        period,
        startDate as string,
        endDate as string
      );

      const churn = await churnAnalyticsService.getChurnMetrics(start, end);

      res.json({
        success: true,
        data: churn,
        statusCode: 200
      });
    } catch (error: any) {
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
  async getPlans(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const distribution = await this.getPlanDistribution();

      res.json({
        success: true,
        data: distribution,
        statusCode: 200
      });
    } catch (error: any) {
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
  async getClients(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { period, startDate, endDate, plan, status, search, limit, offset } =
        clientListSchema.parse(req.query);

      const { startDate: start, endDate: end } = parsePeriod(
        period,
        startDate as string,
        endDate as string
      );

      const result = await funnelAnalyticsService.getClientList(start, end, {
        plan: plan as string,
        status: parseStatus(status as string),
        search: search as string,
        limit,
        offset
      });

      res.json({
        success: true,
        data: result,
        statusCode: 200
      });
    } catch (error: any) {
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
  async getRetention(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { period, startDate, endDate } = periodSchema.parse(req.query);
      const maxMonths = req.query.maxMonths ? parseInt(req.query.maxMonths as string) : 12;

      const { startDate: start, endDate: end } = parsePeriod(
        period,
        startDate as string,
        endDate as string
      );

      const retention = await churnAnalyticsService.getRetentionCurve(
        start,
        end,
        Math.min(maxMonths, 24)
      );

      res.json({
        success: true,
        data: retention,
        statusCode: 200
      });
    } catch (error: any) {
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
  async getPrediction(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const prediction = await churnAnalyticsService.getChurnPrediction();

      res.json({
        success: true,
        data: prediction,
        statusCode: 200
      });
    } catch (error: any) {
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
  async getStrategies(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { period, startDate, endDate } = periodSchema.parse(req.query);

      const { startDate: start, endDate: end } = parsePeriod(
        period,
        startDate as string,
        endDate as string
      );

      const strategies = await churnAnalyticsService.getRetentionStrategies(start, end);

      res.json({
        success: true,
        data: strategies,
        statusCode: 200
      });
    } catch (error: any) {
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
  async getAbandonedTrials(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { period, startDate, endDate } = periodSchema.parse(req.query);

      const { startDate: start, endDate: end } = parsePeriod(
        period,
        startDate as string,
        endDate as string
      );

      const abandoned = await funnelAnalyticsService.getAbandonedTrials(start, end);

      res.json({
        success: true,
        data: abandoned,
        statusCode: 200
      });
    } catch (error: any) {
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
  async getTrend(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { period, startDate, endDate } = periodSchema.parse(req.query);
      const interval = (req.query.interval as 'daily' | 'weekly' | 'monthly') || 'weekly';

      const { startDate: start, endDate: end } = parsePeriod(
        period,
        startDate as string,
        endDate as string
      );

      const trend = await funnelAnalyticsService.getConversionTrend(start, end, interval);

      res.json({
        success: true,
        data: trend,
        statusCode: 200
      });
    } catch (error: any) {
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
  // 🔴 NOVO: FASE 7 - COMPARAÇÃO DE PERÍODOS
  // ============================================

  /**
   * GET /api/admin/analytics/comparison
   * Comparação de métricas entre períodos
   */
  async getComparison(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { period, startDate, endDate, compareWith } = comparisonSchema.parse(req.query);

      const { startDate: start, endDate: end } = parsePeriod(
        period,
        startDate as string,
        endDate as string
      );

      console.log('📊 Buscando comparação entre períodos', { period, compareWith });

      // Calcular período anterior
      const previous = getPreviousPeriod(start, end);

      // Buscar comparação
      const comparison = await revenueAnalyticsService.getPeriodComparison(
        start,
        end,
        previous.startDate,
        previous.endDate
      );

      res.json({
        success: true,
        data: {
          ...comparison,
          currentPeriod: {
            start: start,
            end: end,
            label: parsePeriod(period, startDate as string, endDate as string).label
          },
          previousPeriod: {
            start: previous.startDate,
            end: previous.endDate,
            label: `Período anterior`
          }
        },
        statusCode: 200
      });
    } catch (error: any) {
      console.error('❌ Erro ao buscar comparação entre períodos:', error);
      res.status(500).json({
        success: false,
        message: error?.message || 'Erro ao buscar comparação entre períodos',
        code: 'UNKNOWN_ERROR',
        statusCode: 500
      });
    }
  }

  // ============================================
  // 🔴 NOVO: FASE 7 - PREVISÃO DE RECEITA
  // ============================================

  /**
   * GET /api/admin/analytics/forecast
   * Previsão de receita para os próximos meses
   */
  async getForecast(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { period, startDate, endDate, monthsToForecast } = forecastSchema.parse(req.query);

      const { startDate: start, endDate: end } = parsePeriod(
        period,
        startDate as string,
        endDate as string
      );

      console.log('📊 Gerando previsão de receita', { period, monthsToForecast });

      // Gerar previsão
      const forecast = await revenueAnalyticsService.getRevenueForecast(
        start,
        end,
        monthsToForecast
      );

      res.json({
        success: true,
        data: {
          ...forecast,
          period: {
            start,
            end,
            label: parsePeriod(period, startDate as string, endDate as string).label
          },
          monthsToForecast
        },
        statusCode: 200
      });
    } catch (error: any) {
      console.error('❌ Erro ao gerar previsão de receita:', error);
      res.status(500).json({
        success: false,
        message: error?.message || 'Erro ao gerar previsão de receita',
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
  private async getPlanDistribution(): Promise<Array<{ planName: string; count: number; percentage: number }>> {
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

      const total = result.reduce((sum: number, item: any) => sum + item.count, 0);

      return result.map((item: any) => ({
        planName: item._id,
        count: item.count,
        percentage: total > 0 ? (item.count / total) * 100 : 0
      }));
    } catch (error) {
      console.error('❌ Erro ao calcular distribuição por plano:', error);
      return [];
    }
  }
}

/**
 * Instância única do controller (singleton)
 */
export const funnelAnalyticsController = new FunnelAnalyticsController();
export default funnelAnalyticsController;