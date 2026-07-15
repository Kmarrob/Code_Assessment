/**
 * ============================================
 * ANALYTICS ROUTES
 * ============================================
 * 
 * Rotas para o sistema de funil de conversão.
 * Todas as rotas são protegidas por autenticação
 * e requerem permissão de admin.
 * 
 * @module analytics.routes
 * @since v30.0
 */

import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import mongoose from 'mongoose';
import { authenticate, authorize } from '../middleware/auth.js';
import { UserRole } from '../types/index.js';
import {
  AnalyticsPeriod,
  ClientFunnelStatus
} from '../types/analytics.types.js';

// Importações estáticas dos serviços (Evita conflitos de ESM vs CommonJS / require)
import { revenueAnalyticsService } from '../services/RevenueAnalyticsService.js';
import { funnelAnalyticsService } from '../services/FunnelAnalyticsService.js';
import { churnAnalyticsService } from '../services/ChurnAnalyticsService.js';

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
// UTILITÁRIOS
// ============================================

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
  
  // 🔴 CORRIGIDO: Usar a variável local endDate, não o parâmetro
  endDate.setHours(23, 59, 59, 999);

  return {
    startDate,
    endDate,
    label: `Últimos ${days} dias`
  };
}

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

// ============================================
// HELPERS PARA OS SERVIÇOS (Retornando instâncias estáticas seguras)
// ============================================

function getRevenueService() {
  return revenueAnalyticsService;
}

function getFunnelService() {
  return funnelAnalyticsService;
}

function getChurnService() {
  return churnAnalyticsService;
}

// ============================================
// HANDLERS DAS ROTAS
// ============================================

/**
 * Obtém distribuição por plano usando mongoose.model
 * 🔴 CORRIGIDO: Garantir retorno em todos os caminhos
 */
async function getPlanDistribution(): Promise<Array<{ planName: string; count: number; percentage: number }>> {
  try {
    const Subscription = mongoose.model('Subscription');
    const result = await Subscription.aggregate([
      { $match: { status: { $in: ['active', 'trialing'] } } },
      { $lookup: { from: 'plans', localField: 'planId', foreignField: '_id', as: 'plan' } },
      { $unwind: '$plan' },
      { $group: { _id: '$plan.name', count: { $sum: 1 } } }
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

// ============================================
// HANDLER: GET /summary
// ============================================

async function handleSummary(req: Request, res: Response, next: NextFunction) {
  try {
    const { period, startDate, endDate } = periodSchema.parse(req.query);
    const { startDate: start, endDate: end, label } = parsePeriod(
      period,
      startDate as string,
      endDate as string
    );

    console.log('📊 Buscando resumo de analytics', { period, label });

    const revenueService = getRevenueService();
    const funnelService = getFunnelService();
    const churnService = getChurnService();

    // Executa as consultas com instâncias garantidas
    const [revenue, funnel, churn, statusDistribution, recentClients] = await Promise.all([
      revenueService.getRevenueMetrics(start, end),
      funnelService.getFunnelMetrics(start, end),
      churnService.getChurnMetrics(start, end),
      funnelService.getStatusDistribution(start, end),
      getPlanDistribution(),
      funnelService.getClientList(start, end, { limit: 10 })
    ]);

    // Verifica se recentClients existe e tem clients
    const recentClientsData = (recentClients && typeof recentClients === 'object' && 'clients' in recentClients)
      ? recentClients.clients
      : [];

    res.json({
      success: true,
      data: {
        revenue,
        funnel,
        churn,
        planDistribution: await getPlanDistribution(),
        statusDistribution,
        recentClients: recentClientsData,
        period: { startDate: start, endDate: end, label, type: period },
        generatedAt: new Date()
      },
      statusCode: 200
    });
  } catch (error: any) {
    const safeError = error?.message || error || 'Erro desconhecido no manipulador summary';
    console.error('❌ Erro ao buscar resumo de analytics:', safeError);
    
    return res.status(500).json({
      success: false,
      message: safeError,
      code: "UNKNOWN_ERROR",
      statusCode: 500,
      timestamp: new Date().toISOString(),
      path: "/api/admin/analytics/summary"
    });
  }
}

// ============================================
// HANDLER: GET /revenue
// ============================================

async function handleRevenue(req: Request, res: Response, next: NextFunction) {
  try {
    const { period, startDate, endDate } = periodSchema.parse(req.query);
    const { startDate: start, endDate: end } = parsePeriod(
      period,
      startDate as string,
      endDate as string
    );

    const revenueService = getRevenueService();
    const revenue = await revenueService.getRevenueMetrics(start, end);

    res.json({ success: true, data: revenue, statusCode: 200 });
  } catch (error: any) {
    const safeError = error?.message || error || 'Erro desconhecido no manipulador revenue';
    console.error('❌ Erro ao buscar métricas de receita:', safeError);
    next(error);
  }
}

// ============================================
// HANDLER: GET /funnel
// ============================================

async function handleFunnel(req: Request, res: Response, next: NextFunction) {
  try {
    const { period, startDate, endDate } = periodSchema.parse(req.query);
    const { startDate: start, endDate: end } = parsePeriod(
      period,
      startDate as string,
      endDate as string
    );

    const funnelService = getFunnelService();
    const funnel = await funnelService.getFunnelDetails(start, end);

    res.json({ success: true, data: funnel, statusCode: 200 });
  } catch (error: any) {
    const safeError = error?.message || error || 'Erro desconhecido no manipulador funnel';
    console.error('❌ Erro ao buscar métricas do funil:', safeError);
    next(error);
  }
}

// ============================================
// HANDLER: GET /churn
// ============================================

async function handleChurn(req: Request, res: Response, next: NextFunction) {
  try {
    const { period, startDate, endDate } = periodSchema.parse(req.query);
    const { startDate: start, endDate: end } = parsePeriod(
      period,
      startDate as string,
      endDate as string
    );

    const churnService = getChurnService();
    const churn = await churnService.getChurnMetrics(start, end);

    res.json({ success: true, data: churn, statusCode: 200 });
  } catch (error: any) {
    const safeError = error?.message || error || 'Erro desconhecido no manipulador churn';
    console.error('❌ Erro ao buscar métricas de churn:', safeError);
    next(error);
  }
}

// ============================================
// HANDLER: GET /plans
// ============================================

async function handlePlans(req: Request, res: Response, next: NextFunction) {
  try {
    const distribution = await getPlanDistribution();
    res.json({ success: true, data: distribution, statusCode: 200 });
  } catch (error: any) {
    const safeError = error?.message || error || 'Erro desconhecido no manipulador plans';
    console.error('❌ Erro ao buscar distribuição por plano:', safeError);
    next(error);
  }
}

// ============================================
// HANDLER: GET /clients
// ============================================

async function handleClients(req: Request, res: Response, next: NextFunction) {
  try {
    const { period, startDate, endDate, plan, status, search, limit, offset } =
      clientListSchema.parse(req.query);

    const { startDate: start, endDate: end } = parsePeriod(
      period,
      startDate as string,
      endDate as string
    );

    const funnelService = getFunnelService();
    const result = await funnelService.getClientList(start, end, {
      plan: plan as string,
      status: parseStatus(status as string),
      search: search as string,
      limit,
      offset
    });

    res.json({ success: true, data: result, statusCode: 200 });
  } catch (error: any) {
    const safeError = error?.message || error || 'Erro desconhecido no manipulador clients';
    console.error('❌ Erro ao buscar lista de clientes:', safeError);
    next(error);
  }
}

// ============================================
// HANDLER: GET /retention
// ============================================

async function handleRetention(req: Request, res: Response, next: NextFunction) {
  try {
    const { period, startDate, endDate } = periodSchema.parse(req.query);
    const maxMonths = req.query.maxMonths ? parseInt(req.query.maxMonths as string) : 12;

    const { startDate: start, endDate: end } = parsePeriod(
      period,
      startDate as string,
      endDate as string
    );

    const churnService = getChurnService();
    const retention = await churnService.getRetentionCurve(start, end, Math.min(maxMonths, 24));

    res.json({ success: true, data: retention, statusCode: 200 });
  } catch (error: any) {
    const safeError = error?.message || error || 'Erro desconhecido no manipulador retention';
    console.error('❌ Erro ao buscar curva de retenção:', safeError);
    next(error);
  }
}

// ============================================
// HANDLER: GET /prediction
// ============================================

async function handlePrediction(req: Request, res: Response, next: NextFunction) {
  try {
    const churnService = getChurnService();
    const prediction = await churnService.getChurnPrediction();
    res.json({ success: true, data: prediction, statusCode: 200 });
  } catch (error: any) {
    const safeError = error?.message || error || 'Erro desconhecido no manipulador prediction';
    console.error('❌ Erro ao buscar predição de churn:', safeError);
    next(error);
  }
}

// ============================================
// HANDLER: GET /strategies
// ============================================

async function handleStrategies(req: Request, res: Response, next: NextFunction) {
  try {
    const { period, startDate, endDate } = periodSchema.parse(req.query);
    const { startDate: start, endDate: end } = parsePeriod(
      period,
      startDate as string,
      endDate as string
    );

    const churnService = getChurnService();
    const strategies = await churnService.getRetentionStrategies(start, end);

    res.json({ success: true, data: strategies, statusCode: 200 });
  } catch (error: any) {
    const safeError = error?.message || error || 'Erro desconhecido no manipulador strategies';
    console.error('❌ Erro ao buscar estratégias de retenção:', safeError);
    next(error);
  }
}

// ============================================
// HANDLER: GET /abandoned
// ============================================

async function handleAbandoned(req: Request, res: Response, next: NextFunction) {
  try {
    const { period, startDate, endDate } = periodSchema.parse(req.query);
    const { startDate: start, endDate: end } = parsePeriod(
      period,
      startDate as string,
      endDate as string
    );

    const funnelService = getFunnelService();
    const abandoned = await funnelService.getAbandonedTrials(start, end);

    res.json({ success: true, data: abandoned, statusCode: 200 });
  } catch (error: any) {
    const safeError = error?.message || error || 'Erro desconhecido no manipulador abandoned';
    console.error('❌ Erro ao buscar trials abandonados:', safeError);
    next(error);
  }
}

// ============================================
// HANDLER: GET /trend
// ============================================

async function handleTrend(req: Request, res: Response, next: NextFunction) {
  try {
    const { period, startDate, endDate } = periodSchema.parse(req.query);
    const interval = (req.query.interval as 'daily' | 'weekly' | 'monthly') || 'weekly';

    const { startDate: start, endDate: end } = parsePeriod(
      period,
      startDate as string,
      endDate as string
    );

    const funnelService = getFunnelService();
    const trend = await funnelService.getConversionTrend(start, end, interval);

    res.json({ success: true, data: trend, statusCode: 200 });
  } catch (error: any) {
    const safeError = error?.message || error || 'Erro desconhecido no manipulador trend';
    console.error('❌ Erro ao buscar tendência de conversão:', safeError);
    next(error);
  }
}

// ============================================
// ROTAS
// ============================================

const router = Router();

// Aplicar middleware de autenticação e admin em todas as rotas
router.use(authenticate);
router.use(authorize(UserRole.ADMIN));

// ENDPOINTS PRINCIPAIS
router.get('/summary', handleSummary);
router.get('/revenue', handleRevenue);
router.get('/funnel', handleFunnel);
router.get('/churn', handleChurn);

// ENDPOINTS DE DISTRIBUIÇÃO
router.get('/plans', handlePlans);
router.get('/clients', handleClients);

// ENDPOINTS DE RETENÇÃO
router.get('/retention', handleRetention);
router.get('/prediction', handlePrediction);
router.get('/strategies', handleStrategies);

// ENDPOINTS DE ANÁLISE
router.get('/abandoned', handleAbandoned);
router.get('/trend', handleTrend);

export default router;