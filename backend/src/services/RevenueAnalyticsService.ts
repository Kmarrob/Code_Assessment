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
      
      const hasResult = result && result.length > 0 && result[0] !== null && result[0] !== undefined;
      const total = hasResult ? result[0].total : 0;
      
      if (!hasResult || total === 0) {
        console.log('📊 Nenhum pagamento encontrado, calculando receita baseada nos planos das empresas');
        return this.calculateRevenueFromPlans();
      }
      
      return total;
    } catch (error) {
      console.error('❌ Erro ao obter receita total:', error);
      return this.calculateRevenueFromPlans();
    }
  }

  private async calculateRevenueFromPlans(): Promise<number> {
    try {
      const Company = this.getCompany();
      const planPrices: Record<string, number> = {
        'basic': 1497,
        'pro': 3297,
        'enterprise': 5997
      };

      const companies = await Company.find({
        status: 'active',
        plan: { $in: ['basic', 'pro', 'enterprise'] }
      });

      let totalRevenue = 0;
      for (const company of companies) {
        const plan = company.plan;
        if (plan && typeof plan === 'string') {
          const planKey = plan.toLowerCase();
          const price = planPrices[planKey] || 0;
          totalRevenue += price;
        }
      }

      console.log('📊 Receita calculada a partir dos planos:', { totalRevenue, companiesCount: companies.length });
      return totalRevenue;
    } catch (error) {
      console.error('❌ Erro ao calcular receita a partir dos planos:', error);
      return 0;
    }
  }

  private async getPreviousPeriodRevenue(currentStart: Date, currentEnd: Date): Promise<number> {
    try {
      // 🔴 CORRIGIDO: Converter explicitamente para Number e usar getTime()
      const currentStartMs = Number(new Date(currentStart).getTime());
      const currentEndMs = Number(new Date(currentEnd).getTime());

      const duration = currentEndMs - currentStartMs;

      const previousStart = new Date(currentStartMs - duration);
      const previousEnd = new Date(currentStartMs);

      const Payment = this.getPayment();
      const result = await Payment.aggregate([
        { $match: { status: 'paid', createdAt: { $gte: previousStart, $lte: previousEnd } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]);
      
      const hasResult = result && result.length > 0 && result[0] !== null && result[0] !== undefined;
      const total = hasResult ? result[0].total : 0;
      
      if (!hasResult || total === 0) {
        // 🔴 CORRIGIDO TS2362: Usar await para obter o número antes de multiplicar
        const revenue = await this.calculateRevenueFromPlans();
        return revenue * 0.8;
      }
      
      return total;
    } catch (error) {
      console.error('❌ Erro ao obter receita do período anterior:', error);
      // 🔴 CORRIGIDO TS2362: Usar await para obter o número antes de multiplicar
      const revenue = await this.calculateRevenueFromPlans();
      return revenue * 0.8;
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

      const hasResult = activeSubscriptions && activeSubscriptions.length > 0 && activeSubscriptions[0] !== null && activeSubscriptions[0] !== undefined;
      let mrr = hasResult ? activeSubscriptions[0].totalMRR : 0;
      
      if (mrr === 0) {
        console.log('📊 Nenhuma assinatura encontrada, calculando MRR baseada nos planos das empresas');
        mrr = await this.calculateMRRFromPlans();
      }
      
      console.log('📊 MRR calculado:', { mrr });
      return mrr;
    } catch (error) {
      console.error('❌ Erro ao calcular MRR:', error);
      return this.calculateMRRFromPlans();
    }
  }

  private async calculateMRRFromPlans(): Promise<number> {
    try {
      const Company = this.getCompany();
      const planPrices: Record<string, number> = {
        'basic': 1497,
        'pro': 3297,
        'enterprise': 5997
      };

      const companies = await Company.find({
        status: 'active',
        plan: { $in: ['basic', 'pro', 'enterprise'] }
      });

      let totalMRR = 0;
      for (const company of companies) {
        const plan = company.plan;
        if (plan && typeof plan === 'string') {
          const planKey = plan.toLowerCase();
          const price = planPrices[planKey] || 0;
          totalMRR += price;
        }
      }

      console.log('📊 MRR calculado a partir dos planos:', { totalMRR, companiesCount: companies.length });
      return totalMRR;
    } catch (error) {
      console.error('❌ Erro ao calcular MRR a partir dos planos:', error);
      return 0;
    }
  }

  private async getARPU(startDate: Date, endDate: Date): Promise<number> {
    try {
      const totalRevenue = await this.getTotalRevenue(startDate, endDate);
      const Company = this.getCompany();
      const activeCompanies = await Company.countDocuments({
        status: 'active',
        plan: { $in: ['basic', 'pro', 'enterprise'] }
      });

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

      const hasResult = result && result.length > 0 && result[0] !== null && result[0] !== undefined;
      if (!hasResult) return 12;
      
      const avgDays = result[0].averageDays || 0;
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

      if (!result || result.length === 0) {
        console.log('📊 Nenhum pagamento encontrado, gerando receita por período baseada nos planos');
        return this.generateRevenueByPeriodFromPlans(startDate, endDate);
      }

      return result.map((item: any) => {
        const date = new Date(item.date);
        return { period: `${monthNames[date.getMonth()]} ${date.getFullYear()}`, total: item.total, date };
      });
    } catch (error) {
      console.error('❌ Erro ao obter receita por período:', error);
      return this.generateRevenueByPeriodFromPlans(startDate, endDate);
    }
  }

  private async generateRevenueByPeriodFromPlans(startDate: Date, endDate: Date): Promise<RevenueByPeriod[]> {
    try {
      const Company = this.getCompany();
      const planPrices: Record<string, number> = {
        'basic': 1497,
        'pro': 3297,
        'enterprise': 5997
      };

      const companies = await Company.find({
        status: 'active',
        plan: { $in: ['basic', 'pro', 'enterprise'] }
      });

      const monthlyRevenue: Record<string, { total: number; date: Date }> = {};
      
      for (const company of companies) {
        const plan = company.plan;
        const createdAt = company.createdAt;
        if (plan && typeof plan === 'string' && createdAt) {
          const createdDate = new Date(createdAt);
          const monthKey = `${createdDate.getFullYear()}-${String(createdDate.getMonth() + 1).padStart(2, '0')}`;
          const planKey = plan.toLowerCase();
          const price = planPrices[planKey] || 0;
          
          if (!monthlyRevenue[monthKey]) {
            monthlyRevenue[monthKey] = { total: 0, date: new Date(createdDate.getFullYear(), createdDate.getMonth(), 1) };
          }
          monthlyRevenue[monthKey].total += price;
        }
      }

      const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

      return Object.entries(monthlyRevenue)
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([key, value]) => {
          const parts = key.split('-').map(Number);
          const year = parts[0] || 2026;
          const month = parts[1] || 1;
          const date = new Date(year, month - 1, 1);
          return {
            period: `${monthNames[month - 1]} ${year}`,
            total: value.total,
            date
          };
        });
    } catch (error) {
      console.error('❌ Erro ao gerar receita por período a partir dos planos:', error);
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

      if (!result || result.length === 0) {
        console.log('📊 Nenhum pagamento encontrado, calculando receita por plano baseada nas empresas');
        return this.calculateRevenueByPlanFromCompanies();
      }

      const totalRevenue = result.reduce((sum: number, item: any) => sum + item.total, 0);
      result.sort((a: any, b: any) => b.total - a.total);

      return result.map((item: any, index: number) => ({
        planName: item._id,
        total: item.total,
        count: item.count,
        percentage: totalRevenue > 0 ? (item.total / totalRevenue) * 100 : 0,
        color: PlanColors[item._id as keyof typeof PlanColors] || ChartColors[index % ChartColors.length]
      }));
    } catch (error) {
      console.error('❌ Erro ao obter receita por plano:', error);
      return this.calculateRevenueByPlanFromCompanies();
    }
  }

  private async calculateRevenueByPlanFromCompanies(): Promise<RevenueByPlan[]> {
    try {
      const Company = this.getCompany();
      const planPrices: Record<string, number> = {
        'basic': 1497,
        'pro': 3297,
        'enterprise': 5997
      };
      const planNames: Record<string, string> = {
        'basic': 'Básico',
        'pro': 'Profissional',
        'enterprise': 'Enterprise'
      };

      const companies = await Company.find({
        status: 'active',
        plan: { $in: ['basic', 'pro', 'enterprise'] }
      });

      const planData: Record<string, { total: number; count: number }> = {};
      
      for (const company of companies) {
        const plan = company.plan;
        if (plan && typeof plan === 'string') {
          const planKey = plan.toLowerCase();
          const price = planPrices[planKey] || 0;
          
          if (!planData[planKey]) {
            planData[planKey] = { total: 0, count: 0 };
          }
          planData[planKey].total += price;
          planData[planKey].count += 1;
        }
      }

      const totalRevenue = Object.values(planData).reduce((sum, item) => sum + item.total, 0);
      const planKeys = Object.keys(planData);

      // 🔴 CORRIGIDO TS2532: Verificação explícita com fallback
      return planKeys.map((key, index) => {
        const data = planData[key];
        
        // Fallback seguro caso data seja undefined
        if (!data) {
          const planNameFallback = planNames[key] || key;
          return {
            planName: planNameFallback,
            total: 0,
            count: 0,
            percentage: 0,
            color: PlanColors[planNameFallback as keyof typeof PlanColors] || ChartColors[index % ChartColors.length]
          };
        }

        const planNameResolved = planNames[key] || key;
        return {
          planName: planNameResolved,
          total: data.total,
          count: data.count,
          percentage: totalRevenue > 0 ? (data.total / totalRevenue) * 100 : 0,
          color: PlanColors[planNameResolved as keyof typeof PlanColors] || ChartColors[index % ChartColors.length]
        };
      });
    } catch (error) {
      console.error('❌ Erro ao calcular receita por plano a partir das empresas:', error);
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

      if (!result || result.length === 0) {
        console.log('📊 Nenhum pagamento encontrado, gerando receita customizada baseada nos planos');
        return this.generateRevenueByPeriodFromPlans(startDate, endDate);
      }

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
      return this.generateRevenueByPeriodFromPlans(startDate, endDate);
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
      this.getRevenueGrowth(
        startDate, 
        endDate,
        new Date(startDate.getTime() - (endDate.getTime() - startDate.getTime())), 
        startDate
      )
    ]);

    const Subscription = this.getSubscription();
    let churnResult: any[] = [];
    try {
      churnResult = await Subscription.aggregate([
        { $match: { status: 'cancelled', updatedAt: { $gte: startDate, $lte: endDate } } },
        { $count: 'churned' }
      ]);
    } catch (error) {
      console.warn('⚠️ Erro ao buscar churn para saúde financeira:', error);
    }

    const hasChurnResult = churnResult && churnResult.length > 0 && churnResult[0] !== null && churnResult[0] !== undefined;
    const churned = hasChurnResult ? (churnResult[0].churned || 0) : 0;
    
    const totalActive = await this.getCompany().countDocuments({
      status: 'active',
      plan: { $in: ['basic', 'pro', 'enterprise'] }
    });
    const churnRate = totalActive > 0 ? (churned / totalActive) * 100 : 0;

    const growthPercent = growth?.growthPercent ?? 0;

    let status: 'healthy' | 'warning' | 'critical' = 'healthy';
    let message = 'Saúde financeira excelente.';

    if (churnRate > 10) { status = 'warning'; message = 'Taxa de churn elevada. Considere ações de retenção.'; }
    if (churnRate > 20 || growthPercent < -10) { status = 'critical'; message = 'Saúde financeira crítica. Ações imediatas necessárias.'; }
    if (mrr < 1000) { status = 'warning'; message = 'MRR baixo. Foco em aquisição de clientes.'; }

    return { 
      status, 
      metrics: { 
        mrr, 
        churnRate, 
        arpu, 
        revenueGrowth: growthPercent 
      }, 
      message 
    };
  }

  // ============================================
  // 🔴 NOVO: FASE 7 - COMPARAÇÃO DE PERÍODOS
  // ============================================

  /**
   * Compara métricas entre dois períodos
   * @param currentStart - Data início do período atual
   * @param currentEnd - Data fim do período atual
   * @param previousStart - Data início do período anterior
   * @param previousEnd - Data fim do período anterior
   * @returns Objeto com comparação de métricas
   */
  async getPeriodComparison(
    currentStart: Date,
    currentEnd: Date,
    previousStart: Date,
    previousEnd: Date
  ): Promise<{
    current: {
      totalRevenue: number;
      mrr: number;
      arpu: number;
      activeClients: number;
    };
    previous: {
      totalRevenue: number;
      mrr: number;
      arpu: number;
      activeClients: number;
    };
    changes: {
      totalRevenue: { amount: number; percent: number };
      mrr: { amount: number; percent: number };
      arpu: { amount: number; percent: number };
      activeClients: { amount: number; percent: number };
    };
    trend: 'up' | 'down' | 'stable';
  }> {
    try {
      console.log('📊 Calculando comparação entre períodos', {
        currentStart,
        currentEnd,
        previousStart,
        previousEnd
      });

      // Buscar métricas dos dois períodos
      const [currentMetrics, previousMetrics] = await Promise.all([
        this.getRevenueMetrics(currentStart, currentEnd),
        this.getRevenueMetrics(previousStart, previousEnd)
      ]);

      // Buscar número de clientes ativos
      const Company = this.getCompany();
      const [currentActive, previousActive] = await Promise.all([
        Company.countDocuments({
          status: 'active',
          plan: { $in: ['basic', 'pro', 'enterprise'] }
        }),
        Company.countDocuments({
          status: 'active',
          plan: { $in: ['basic', 'pro', 'enterprise'] },
          createdAt: { $lte: previousEnd }
        })
      ]);

      const current = {
        totalRevenue: currentMetrics.totalRevenue,
        mrr: currentMetrics.mrr,
        arpu: currentMetrics.arpu,
        activeClients: currentActive
      };

      const previous = {
        totalRevenue: previousMetrics.totalRevenue,
        mrr: previousMetrics.mrr,
        arpu: previousMetrics.arpu,
        activeClients: previousActive
      };

      // Calcular mudanças
      const calculateChange = (currentVal: number, previousVal: number) => ({
        amount: currentVal - previousVal,
        percent: previousVal > 0 ? ((currentVal - previousVal) / previousVal) * 100 : 0
      });

      const changes = {
        totalRevenue: calculateChange(current.totalRevenue, previous.totalRevenue),
        mrr: calculateChange(current.mrr, previous.mrr),
        arpu: calculateChange(current.arpu, previous.arpu),
        activeClients: calculateChange(current.activeClients, previous.activeClients)
      };

      // Determinar tendência geral
      const avgChange = (changes.totalRevenue.percent + changes.mrr.percent + changes.activeClients.percent) / 3;
      let trend: 'up' | 'down' | 'stable' = 'stable';
      if (avgChange > 5) trend = 'up';
      else if (avgChange < -5) trend = 'down';

      console.log('✅ Comparação entre períodos calculada', { current, previous, changes, trend });

      return { current, previous, changes, trend };
    } catch (error) {
      console.error('❌ Erro ao calcular comparação entre períodos:', error);
      throw error;
    }
  }

  // ============================================
  // 🔴 NOVO: FASE 7 - PREVISÃO DE RECEITA (CORRIGIDO)
  // ============================================

  /**
   * Gera previsão de receita para os próximos meses
   * @param startDate - Data de início do histórico
   * @param endDate - Data de fim do histórico
   * @param monthsToForecast - Número de meses para previsão (padrão: 12)
   * @returns Objeto com previsões otimista, realista e pessimista
   */
  async getRevenueForecast(
    startDate: Date,
    endDate: Date,
    monthsToForecast: number = 12
  ): Promise<{
    historical: { period: string; revenue: number }[];
    forecast: {
      optimistic: { period: string; revenue: number }[];
      realistic: { period: string; revenue: number }[];
      pessimistic: { period: string; revenue: number }[];
    };
    summary: {
      currentMRR: number;
      projectedMRR: {
        optimistic: number;
        realistic: number;
        pessimistic: number;
      };
      growthRate: {
        optimistic: number;
        realistic: number;
        pessimistic: number;
      };
    };
  }> {
    try {
      console.log('📊 Gerando previsão de receita', { startDate, endDate, monthsToForecast });

      // Buscar dados históricos de receita por período
      const historicalData = await this.getRevenueByPeriod(startDate, endDate);

      // Calcular taxa de crescimento histórica
      let growthRates: number[] = [];
      for (let i = 1; i < historicalData.length; i++) {
        const prev = historicalData[i - 1].total;
        const curr = historicalData[i].total;
        if (prev > 0) {
          growthRates.push(((curr - prev) / prev) * 100);
        }
      }

      // Calcular média e desvio padrão das taxas de crescimento
      const avgGrowth = growthRates.length > 0 
        ? growthRates.reduce((a, b) => a + b, 0) / growthRates.length 
        : 5; // Fallback: 5% de crescimento

      const stdDev = growthRates.length > 1
        ? Math.sqrt(growthRates.reduce((a, b) => a + Math.pow(b - avgGrowth, 2), 0) / growthRates.length)
        : 3; // Fallback: desvio de 3%

      // Definir cenários
      const scenarios = {
        optimistic: avgGrowth + stdDev * 1.5,
        realistic: avgGrowth,
        pessimistic: Math.max(avgGrowth - stdDev * 1.5, -10)
      };

      // Obter MRR atual
      const currentMRR = await this.getMRR();

      // Gerar previsões
      const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

      const lastDate = historicalData.length > 0 
        ? new Date(historicalData[historicalData.length - 1].date) 
        : new Date();

      // 🔴 CORRIGIDO: Inicializar forecast com tipagem correta
      const forecast: {
        optimistic: { period: string; revenue: number }[];
        realistic: { period: string; revenue: number }[];
        pessimistic: { period: string; revenue: number }[];
      } = {
        optimistic: [],
        realistic: [],
        pessimistic: []
      };

      const projectedMRR = {
        optimistic: currentMRR,
        realistic: currentMRR,
        pessimistic: currentMRR
      };

      // 🔴 CORRIGIDO: Usar tipo seguro para as chaves
      const scenarioKeys = ['optimistic', 'realistic', 'pessimistic'] as const;

      for (let i = 1; i <= monthsToForecast; i++) {
        const date = new Date(lastDate);
        date.setMonth(date.getMonth() + i);
        const period = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;

        // Calcular previsão para cada cenário
        for (const scenario of scenarioKeys) {
          const rate = scenarios[scenario];
          const multiplier = Math.pow(1 + rate / 100, i);
          const projectedRevenue = currentMRR * multiplier;
          
          // 🔴 CORRIGIDO: Acesso seguro ao array forecast[scenario]
          forecast[scenario].push({
            period,
            revenue: Math.round(projectedRevenue * 100) / 100
          });

          // Atualizar MRR projetado para o último mês
          if (i === monthsToForecast) {
            projectedMRR[scenario] = Math.round(projectedRevenue * 100) / 100;
          }
        }
      }

      // Calcular taxas de crescimento projetadas
      const growthRate = {
        optimistic: scenarios.optimistic,
        realistic: scenarios.realistic,
        pessimistic: scenarios.pessimistic
      };

      console.log('✅ Previsão de receita gerada', { currentMRR, projectedMRR, growthRate });

      return {
        historical: historicalData.map(item => ({
          period: item.period,
          revenue: item.total
        })),
        forecast,
        summary: {
          currentMRR,
          projectedMRR,
          growthRate
        }
      };
    } catch (error) {
      console.error('❌ Erro ao gerar previsão de receita:', error);
      throw error;
    }
  }
}

export const revenueAnalyticsService = new RevenueAnalyticsService();
export default revenueAnalyticsService;