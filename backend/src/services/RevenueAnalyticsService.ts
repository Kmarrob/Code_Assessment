/**
 * ============================================
 * REVENUE ANALYTICS SERVICE
 * ============================================
 * 
 * Serviço responsável por calcular métricas de receita
 * para o sistema de funil de conversão.
 * 
 * @module RevenueAnalyticsService
 * @since v30.0
 */

import mongoose from 'mongoose';
import {
  RevenueMetrics,
  RevenueByPeriod,
  RevenueByPlan,
  PeriodConfig,
  PlanColors,
  ChartColors
} from '../types/analytics.types';

export class RevenueAnalyticsService {
  private getPayment() {
    return mongoose.model('Payment');
  }

  private getSubscription() {
    return mongoose.model('Subscription');
  }

  private getPlan() {
    return mongoose.model('Plan');
  }

  private getCompany() {
    return mongoose.model('Company');
  }

  async getRevenueMetrics(startDate: Date, endDate: Date): Promise<RevenueMetrics> {
    try {
      console.log('📊 Calculando métricas de receita', { startDate, endDate });

      const [
        totalRevenue,
        mrr,
        arpu,
        revenueByPeriod,
        revenueByPlan,
        previousRevenue
      ] = await Promise.all([
        this.getTotalRevenue(startDate, endDate),
        this.getMRR(),
        this.getARPU(startDate, endDate),
        this.getRevenueByPeriod(startDate, endDate),
        this.getRevenueByPlan(startDate, endDate),
        this.getPreviousPeriodRevenue(startDate, endDate)
      ]);

      const arr = mrr * 12;
      const averageLifetime = await this.getAverageLifetime();
      const ltv = arpu * averageLifetime;
      const growthPercent = previousRevenue > 0 ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 : 0;

      console.log('✅ Métricas de receita calculadas com sucesso', { totalRevenue, mrr, arr, arpu, ltv, growthPercent });

      return { totalRevenue, mrr, arr, arpu, ltv, revenueByPeriod, revenueByPlan, growthPercent };
    } catch (error) {
      console.error('❌ Erro ao calcular métricas de receita:', error);
      throw error;
    }
  }

  private async getTotalRevenue(startDate: Date, endDate: Date): Promise<number> {
    try {
      const Payment = this.getPayment();
      const result = await Payment.aggregate([
        { $match: { status: 'paid', createdAt: { $gte: startDate, $lte: endDate } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]);
      return result.length > 0 ? result[0].total : 0;
    } catch (error) {
      console.error('❌ Erro ao obter receita total:', error);
      return 0;
    }
  }

  private async getPreviousPeriodRevenue(currentStart: Date, currentEnd: Date): Promise<number> {
    try {
      const duration = currentEnd.getTime() - currentStart.getTime();
      const previousStart = new Date(currentStart.getTime() - duration);
      const previousEnd = new Date(currentStart.getTime());

      const Payment = this.getPayment();
      const result = await Payment.aggregate([
        { $match: { status: 'paid', createdAt: { $gte: previousStart, $lte: previousEnd } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]);
      return result.length > 0 ? result[0].total : 0;
    } catch (error) {
      console.error('❌ Erro ao obter receita do período anterior:', error);
      return 0;
    }
  }

  async getMRR(): Promise<number> {
    try {
      const Subscription = this.getSubscription();
      const activeSubscriptions = await Subscription.aggregate([
        { $match: { status: { $in: ['active', 'trialing'] } } },
        { $lookup: { from: 'plans', localField: 'planId', foreignField: '_id', as: 'plan' } },
        { $unwind: '$plan' },
        { $group: { _id: null, totalMRR: { $sum: '$plan.price' } } }
      ]);

      const mrr = activeSubscriptions.length > 0 ? activeSubscriptions[0].totalMRR : 0;
      console.log('📊 MRR calculado:', { mrr });
      return mrr;
    } catch (error) {
      console.error('❌ Erro ao calcular MRR:', error);
      return 0;
    }
  }

  private async getARPU(startDate: Date, endDate: Date): Promise<number> {
    try {
      const totalRevenue = await this.getTotalRevenue(startDate, endDate);
      const Company = this.getCompany();
      const activeCompanies = await Company.countDocuments({});

      if (activeCompanies === 0) return 0;
      const arpu = totalRevenue / activeCompanies;
      console.log('📊 ARPU calculado:', { arpu, activeCompanies, totalRevenue });
      return arpu;
    } catch (error) {
      console.error('❌ Erro ao calcular ARPU:', error);
      return 0;
    }
  }

  private async getAverageLifetime(): Promise<number> {
    try {
      const Subscription = this.getSubscription();
      const result = await Subscription.aggregate([
        { $match: { status: 'cancelled' } },
        {
          $project: {
            lifetimeDays: {
              $divide: [{ $subtract: ['$updatedAt', '$startDate'] }, 1000 * 60 * 60 * 24]
            }
          }
        },
        { $group: { _id: null, averageDays: { $avg: '$lifetimeDays' } } }
      ]);

      if (result.length === 0) return 12;
      const avgDays = result[0].averageDays;
      const avgMonths = avgDays / 30.44;
      console.log('📊 Tempo médio de vida calculado:', { avgMonths, avgDays });
      return Math.max(avgMonths, 1);
    } catch (error) {
      console.error('❌ Erro ao calcular tempo médio de vida:', error);
      return 12;
    }
  }

  private async getRevenueByPeriod(startDate: Date, endDate: Date): Promise<RevenueByPeriod[]> {
    try {
      const Payment = this.getPayment();
      const result = await Payment.aggregate([
        { $match: { status: 'paid', createdAt: { $gte: startDate, $lte: endDate } } },
        {
          $group: {
            _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
            total: { $sum: '$amount' },
            date: { $first: '$createdAt' }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ]);

      const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

      return result.map((item: any) => {
        const date = new Date(item.date);
        return { period: `${monthNames[date.getMonth()]} ${date.getFullYear()}`, total: item.total, date };
      });
    } catch (error) {
      console.error('❌ Erro ao obter receita por período:', error);
      return [];
    }
  }

  private async getRevenueByPlan(startDate: Date, endDate: Date): Promise<RevenueByPlan[]> {
    try {
      const Payment = this.getPayment();
      const result = await Payment.aggregate([
        { $match: { status: 'paid', createdAt: { $gte: startDate, $lte: endDate } } },
        { $lookup: { from: 'subscriptions', localField: 'subscriptionId', foreignField: '_id', as: 'subscription' } },
        { $unwind: '$subscription' },
        { $lookup: { from: 'plans', localField: 'subscription.planId', foreignField: '_id', as: 'plan' } },
        { $unwind: '$plan' },
        { $group: { _id: '$plan.name', total: { $sum: '$amount' }, count: { $sum: 1 } } }
      ]);

      const totalRevenue = result.reduce((sum: number, item: any) => sum + item.total, 0);
      result.sort((a: any, b: any) => b.total - a.total);

      return result.map((item: any, index: number) => ({
        planName: item._id,
        total: item.total,
        count: item.count,
        percentage: totalRevenue > 0 ? (item.total / totalRevenue) * 100 : 0,
        color: PlanColors[item._id] || ChartColors[index % ChartColors.length]
      }));
    } catch (error) {
      console.error('❌ Erro ao obter receita por plano:', error);
      return [];
    }
  }

  async getRevenueByPeriodCustom(
    startDate: Date,
    endDate: Date,
    interval: 'daily' | 'weekly' | 'monthly' = 'monthly'
  ): Promise<RevenueByPeriod[]> {
    try {
      let groupBy: any;
      switch (interval) {
        case 'daily':
          groupBy = { year: { $year: '$createdAt' }, month: { $month: '$createdAt' }, day: { $dayOfMonth: '$createdAt' } };
          break;
        case 'weekly':
          groupBy = { year: { $year: '$createdAt' }, week: { $week: '$createdAt' } };
          break;
        default:
          groupBy = { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } };
      }

      const Payment = this.getPayment();
      const result = await Payment.aggregate([
        { $match: { status: 'paid', createdAt: { $gte: startDate, $lte: endDate } } },
        { $group: { _id: groupBy, total: { $sum: '$amount' }, date: { $first: '$createdAt' } } },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ]);

      const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

      return result.map((item: any) => {
        const date = new Date(item.date);
        let period = '';
        switch (interval) {
          case 'daily':
            period = date.toLocaleDateString('pt-BR');
            break;
          case 'weekly':
            period = `Semana ${item._id.week} ${date.getFullYear()}`;
            break;
          default:
            period = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
        }
        return { period, total: item.total, date };
      });
    } catch (error) {
      console.error('❌ Erro ao obter receita por período customizado:', error);
      return [];
    }
  }

  async getRevenueMetricsForPeriod(periodConfig: PeriodConfig): Promise<RevenueMetrics> {
    return this.getRevenueMetrics(periodConfig.startDate, periodConfig.endDate);
  }

  async getRevenueGrowth(
    currentStart: Date,
    currentEnd: Date,
    previousStart: Date,
    previousEnd: Date
  ): Promise<{ currentRevenue: number; previousRevenue: number; growthAmount: number; growthPercent: number }> {
    const [currentRevenue, previousRevenue] = await Promise.all([
      this.getTotalRevenue(currentStart, currentEnd),
      this.getTotalRevenue(previousStart, previousEnd)
    ]);
    const growthAmount = currentRevenue - previousRevenue;
    const growthPercent = previousRevenue > 0 ? (growthAmount / previousRevenue) * 100 : 0;
    return { currentRevenue, previousRevenue, growthAmount, growthPercent };
  }

  async getFinancialHealth(startDate: Date, endDate: Date): Promise<{
    status: 'healthy' | 'warning' | 'critical';
    metrics: { mrr: number; churnRate: number; arpu: number; revenueGrowth: number };
    message: string;
  }> {
    const [mrr, arpu, growth] = await Promise.all([
      this.getMRR(),
      this.getARPU(startDate, endDate),
      this.getRevenueGrowth(startDate, endDate,
        new Date(startDate.getTime() - (endDate.getTime() - startDate.getTime())), startDate)
    ]);

    const Subscription = this.getSubscription();
    const churnResult = await Subscription.aggregate([
      { $match: { status: 'cancelled', updatedAt: { $gte: startDate, $lte: endDate } } },
      { $count: 'churned' }
    ]);

    const churned = churnResult.length > 0 ? churnResult[0].churned : 0;
    const totalActive = await Subscription.countDocuments({ status: 'active' });
    const churnRate = totalActive > 0 ? (churned / totalActive) * 100 : 0;

    let status: 'healthy' | 'warning' | 'critical' = 'healthy';
    let message = 'Saúde financeira excelente.';

    if (churnRate > 10) { status = 'warning'; message = 'Taxa de churn elevada. Considere ações de retenção.'; }
    if (churnRate > 20 || growth.growthPercent < -10) { status = 'critical'; message = 'Saúde financeira crítica. Ações imediatas necessárias.'; }
    if (mrr < 1000) { status = 'warning'; message = 'MRR baixo. Foco em aquisição de clientes.'; }

    return { status, metrics: { mrr, churnRate, arpu, revenueGrowth: growth.growthPercent }, message };
  }
}

export const revenueAnalyticsService = new RevenueAnalyticsService();
export default revenueAnalyticsService;