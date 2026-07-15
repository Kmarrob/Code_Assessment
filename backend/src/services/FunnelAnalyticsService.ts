/**
 * ============================================
 * FUNNEL ANALYTICS SERVICE
 * ============================================
 * 
 * Serviço responsável por calcular métricas de funil
 * de conversão para o sistema de analytics.
 * 
 * @module FunnelAnalyticsService
 * @since v30.0
 */

import mongoose from 'mongoose';
import {
  FunnelMetrics,
  FunnelDetails,
  FunnelStep,
  ClientListItem,
  StatusDistribution,
  ClientFunnelStatus,
  FunnelStatusLabels,
  FunnelStatusColors,
  AnalyticsQueryParams,
  PlanColors,
  ChartColors
} from '../types/analytics.types';
import { revenueAnalyticsService } from './RevenueAnalyticsService';

export class FunnelAnalyticsService {
  private getCompany() {
    return mongoose.model('Company');
  }

  private getSubscription() {
    return mongoose.model('Subscription');
  }

  private getPayment() {
    return mongoose.model('Payment');
  }

  private getUser() {
    return mongoose.model('User');
  }

  private getPlan() {
    return mongoose.model('Plan');
  }

  /**
   * Obtém métricas completas do funil para um período
   */
  async getFunnelMetrics(
    startDate: Date,
    endDate: Date
  ): Promise<FunnelMetrics> {
    try {
      console.log('📊 Calculando métricas do funil', { startDate, endDate });

      const Company = this.getCompany();
      const Subscription = this.getSubscription();
      const Payment = this.getPayment();

      const totalRegistrations = await Company.countDocuments();
      const activeTrials = await Subscription.countDocuments({
        status: { $in: ['trial', 'trialing'] },
        trialEnd: { $gt: new Date() }
      });
      const convertedToPaid = await this.getConvertedToPaid(startDate, endDate);
      const activeSubscriptions = await Subscription.countDocuments({
        status: { $in: ['active', 'trialing'] }
      });
      const churned = await Subscription.countDocuments({
        status: 'cancelled',
        updatedAt: { $gte: startDate, $lte: endDate }
      });
      const trialExpired = await Subscription.countDocuments({
        status: 'expired',
        updatedAt: { $gte: startDate, $lte: endDate }
      });

      const conversionRate = totalRegistrations > 0
        ? (convertedToPaid / totalRegistrations) * 100
        : 0;

      const abandonmentRate = totalRegistrations > 0
        ? (trialExpired / totalRegistrations) * 100
        : 0;

      const averageTicket = await this.getAverageTicket(convertedToPaid);

      const metrics: FunnelMetrics = {
        totalRegistrations,
        activeTrials,
        convertedToPaid,
        activeSubscriptions,
        churned,
        conversionRate,
        abandonmentRate,
        trialExpired,
        averageTicket
      };

      console.log('✅ Métricas do funil calculadas', metrics);
      return metrics;
    } catch (error) {
      console.error('❌ Erro ao calcular métricas do funil:', error);
      throw error;
    }
  }

  /**
   * Obtém detalhamento completo do funil com etapas
   */
  async getFunnelDetails(
    startDate: Date,
    endDate: Date
  ): Promise<FunnelDetails> {
    try {
      const metrics = await this.getFunnelMetrics(startDate, endDate);

      const steps: FunnelStep[] = [
        {
          step: 'registrations',
          label: 'Cadastros',
          count: metrics.totalRegistrations,
          percentage: 100,
          color: '#3B82F6'
        },
        {
          step: 'trials',
          label: 'Em Trial',
          count: metrics.activeTrials,
          percentage: metrics.totalRegistrations > 0
            ? (metrics.activeTrials / metrics.totalRegistrations) * 100
            : 0,
          color: '#F59E0B'
        },
        {
          step: 'conversions',
          label: 'Conversões',
          count: metrics.convertedToPaid,
          percentage: metrics.totalRegistrations > 0
            ? (metrics.convertedToPaid / metrics.totalRegistrations) * 100
            : 0,
          color: '#10B981'
        },
        {
          step: 'active',
          label: 'Ativos',
          count: metrics.activeSubscriptions,
          percentage: metrics.convertedToPaid > 0
            ? (metrics.activeSubscriptions / metrics.convertedToPaid) * 100
            : 0,
          color: '#059669'
        }
      ];

      // 🔴 CORRIGIDO: Verifica se prevStep existe antes de acessar
      for (let i = 1; i < steps.length; i++) {
        const step = steps[i];
        const prevStep = steps[i - 1];
        if (prevStep && prevStep.count > 0) {
          step.percentage = (step.count / prevStep.count) * 100;
        }
      }

      console.log('📊 Detalhes do funil calculados', { steps });
      return { steps, metrics };
    } catch (error) {
      console.error('❌ Erro ao calcular detalhes do funil:', error);
      throw error;
    }
  }

  /**
   * Obtém lista de clientes com status no funil
   */
  async getClientList(
    startDate: Date,
    endDate: Date,
    filters?: {
      plan?: string;
      status?: ClientFunnelStatus;
      search?: string;
      limit?: number;
      offset?: number;
    }
  ): Promise<{
    clients: ClientListItem[];
    total: number;
    page: number;
    limit: number;
  }> {
    try {
      const limit = filters?.limit || 20;
      const offset = filters?.offset || 0;

      const Company = this.getCompany();
      const Subscription = this.getSubscription();
      const Payment = this.getPayment();
      const User = this.getUser();
      const Plan = this.getPlan();

      const companies = await Company.find({})
        .skip(offset)
        .limit(limit)
        .sort({ createdAt: -1 });

      const total = await Company.countDocuments({});

      const clients: ClientListItem[] = [];

      for (const company of companies) {
        const subscription = await Subscription.findOne({
          companyId: company._id,
          status: { $in: ['trial', 'active', 'trialing', 'past_due', 'cancelled'] }
        });

        const payments = await Payment.find({
          companyId: company._id,
          status: 'paid'
        });

        const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
        const users = await User.find({ companyId: company._id });
        const userCount = users.length;
        const funnelStatus = await this.determineFunnelStatus(company, subscription, payments);

        if (filters?.status && filters.status !== funnelStatus) continue;
        if (filters?.plan && subscription?.planId?.name !== filters.plan) continue;

        const lastLogin = users.length > 0
          ? users.reduce((latest, u) => {
            if (!latest) return u.lastLogin;
            return u.lastLogin && u.lastLogin > latest ? u.lastLogin : latest;
          }, null)
          : undefined;

        let nextBilling: Date | undefined;
        if (subscription && subscription.status === 'active') {
          const nextMonth = new Date();
          nextMonth.setMonth(nextMonth.getMonth() + 1);
          nextBilling = nextMonth;
        }

        let planName = 'Nenhum';
        let monthlyValue = 0;
        if (subscription && subscription.planId) {
          const plan = await Plan.findById(subscription.planId);
          if (plan) {
            planName = plan.name;
            monthlyValue = plan.price || 0;
          }
        }

        clients.push({
          id: company._id.toString(),
          name: company.name,
          document: company.cnpj || undefined,
          planName,
          funnelStatus,
          subscriptionStatus: subscription?.status || 'none',
          joinedAt: company.createdAt,
          lastLogin: lastLogin || undefined,
          monthlyValue,
          totalPaid,
          nextBilling,
          userCount
        });
      }

      let filteredClients = clients;
      if (filters?.search) {
        const search = filters.search.toLowerCase();
        filteredClients = clients.filter(c =>
          c.name.toLowerCase().includes(search) ||
          c.id.includes(search)
        );
      }

      console.log('📊 Lista de clientes gerada', { total: filteredClients.length });

      return {
        clients: filteredClients,
        total,
        page: Math.floor(offset / limit) + 1,
        limit
      };
    } catch (error) {
      console.error('❌ Erro ao obter lista de clientes:', error);
      throw error;
    }
  }

  /**
   * Obtém distribuição de status dos clientes
   */
  async getStatusDistribution(
    startDate: Date,
    endDate: Date
  ): Promise<StatusDistribution[]> {
    try {
      const distribution: StatusDistribution[] = [];
      const statuses: ClientFunnelStatus[] = [
        'registered',
        'trialing',
        'trial_expired',
        'converted',
        'active',
        'past_due',
        'cancelled',
        'churned'
      ];

      const Company = this.getCompany();
      const Subscription = this.getSubscription();
      const Payment = this.getPayment();

      const companies = await Company.find({});
      const total = companies.length;

      const statusCounts: Record<ClientFunnelStatus, number> = {} as any;

      for (const company of companies) {
        const subscription = await Subscription.findOne({
          companyId: company._id
        });

        const payments = await Payment.find({
          companyId: company._id,
          status: 'paid'
        });

        const status = await this.determineFunnelStatus(company, subscription, payments);
        statusCounts[status] = (statusCounts[status] || 0) + 1;
      }

      for (const status of statuses) {
        const count = statusCounts[status] || 0;
        distribution.push({
          status,
          label: FunnelStatusLabels[status],
          count,
          percentage: total > 0 ? (count / total) * 100 : 0,
          color: FunnelStatusColors[status]
        });
      }

      distribution.sort((a, b) => b.count - a.count);

      console.log('📊 Distribuição de status calculada', { distribution });
      return distribution;
    } catch (error) {
      console.error('❌ Erro ao calcular distribuição de status:', error);
      throw error;
    }
  }

  /**
   * Obtém trials abandonados (não converteram após 7 dias)
   */
  async getAbandonedTrials(startDate: Date, endDate: Date): Promise<{
    total: number;
    clients: {
      companyId: string;
      companyName: string;
      trialStart: Date;
      trialEnd: Date;
      daysActive: number;
    }[];
  }> {
    try {
      const Subscription = this.getSubscription();
      const Payment = this.getPayment();
      const Company = this.getCompany();

      const expiredTrials = await Subscription.find({
        status: 'cancelled',
        trialEnd: { $gte: startDate, $lte: endDate }
      });

      const abandoned: any[] = [];

      for (const sub of expiredTrials) {
        const payment = await Payment.findOne({
          subscriptionId: sub._id,
          status: 'paid'
        });

        if (!payment) {
          const company = await Company.findById(sub.companyId);
          if (company) {
            const daysActive = Math.floor(
              (new Date().getTime() - sub.startDate.getTime()) / (1000 * 60 * 60 * 24)
            );

            abandoned.push({
              companyId: company._id.toString(),
              companyName: company.name,
              trialStart: sub.startDate,
              trialEnd: sub.trialEnd || sub.startDate,
              daysActive
            });
          }
        }
      }

      console.log('📊 Trials abandonados encontrados', { total: abandoned.length });
      return {
        total: abandoned.length,
        clients: abandoned
      };
    } catch (error) {
      console.error('❌ Erro ao buscar trials abandonados:', error);
      throw error;
    }
  }

  /**
   * Obtém tendência de conversão ao longo do tempo
   */
  async getConversionTrend(
    startDate: Date,
    endDate: Date,
    interval: 'daily' | 'weekly' | 'monthly' = 'weekly'
  ): Promise<{
    periods: string[];
    registrations: number[];
    conversions: number[];
    conversionRates: number[];
  }> {
    try {
      const periods: string[] = [];
      const registrations: number[] = [];
      const conversions: number[] = [];
      const conversionRates: number[] = [];

      const Company = this.getCompany();
      const Payment = this.getPayment();

      const current = new Date(startDate);
      while (current <= endDate) {
        let periodLabel = '';
        let periodStart = new Date(current);
        let periodEnd = new Date(current);

        switch (interval) {
          case 'daily':
            periodLabel = current.toLocaleDateString('pt-BR');
            periodEnd.setHours(23, 59, 59, 999);
            break;
          case 'weekly':
            periodLabel = `Semana ${current.toISOString().split('-')[1]}-${current.getFullYear()}`;
            periodEnd.setDate(current.getDate() + 6);
            periodEnd.setHours(23, 59, 59, 999);
            break;
          default:
            periodLabel = current.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });
            periodEnd.setMonth(current.getMonth() + 1);
            periodEnd.setDate(0);
            periodEnd.setHours(23, 59, 59, 999);
        }

        periods.push(periodLabel);

        const regCount = await Company.countDocuments({
          createdAt: { $gte: periodStart, $lte: periodEnd }
        });

        registrations.push(regCount);

        const convCount = await Payment.countDocuments({
          status: 'paid',
          createdAt: { $gte: periodStart, $lte: periodEnd }
        });

        conversions.push(convCount);
        conversionRates.push(regCount > 0 ? (convCount / regCount) * 100 : 0);

        switch (interval) {
          case 'daily':
            current.setDate(current.getDate() + 1);
            break;
          case 'weekly':
            current.setDate(current.getDate() + 7);
            break;
          default:
            current.setMonth(current.getMonth() + 1);
        }
      }

      return { periods, registrations, conversions, conversionRates };
    } catch (error) {
      console.error('❌ Erro ao calcular tendência de conversão:', error);
      throw error;
    }
  }

  // ============================================
  // MÉTODOS PRIVADOS
  // ============================================

  /**
   * Determina o status de uma empresa no funil
   */
  private async determineFunnelStatus(
    company: any,
    subscription: any | null,
    payments: any[]
  ): Promise<ClientFunnelStatus> {
    const Payment = this.getPayment();

    if (!subscription) {
      return 'registered';
    }

    if (payments.length > 0) {
      const lastPayment = payments[payments.length - 1];
      if (lastPayment.status === 'paid') {
        if (subscription.status === 'active' || subscription.status === 'trialing') {
          return 'active';
        }
        if (subscription.status === 'cancelled') {
          return 'cancelled';
        }
        if (subscription.status === 'past_due') {
          return 'past_due';
        }
        return 'converted';
      }
    }

    switch (subscription.status) {
      case 'trial':
      case 'trialing':
        if (subscription.trialEnd && new Date() > subscription.trialEnd) {
          return 'trial_expired';
        }
        return 'trialing';

      case 'active':
        return 'active';

      case 'past_due':
        return 'past_due';

      case 'cancelled':
        const hasPayment = await Payment.exists({
          companyId: company._id,
          status: 'paid'
        });
        if (hasPayment) {
          return 'cancelled';
        }
        if (subscription.trialEnd && subscription.trialEnd < new Date()) {
          return 'trial_expired';
        }
        return 'registered';

      case 'expired':
        return 'trial_expired';

      default:
        return 'registered';
    }
  }

  /**
   * Obtém total de registros (TODAS as empresas cadastradas)
   */
  private async getTotalRegistrations(): Promise<number> {
    const Company = this.getCompany();
    return Company.countDocuments();
  }

  /**
   * Obtém trials ativos
   */
  private async getActiveTrials(): Promise<number> {
    const Subscription = this.getSubscription();
    return Subscription.countDocuments({
      status: { $in: ['trial', 'trialing'] },
      trialEnd: { $gt: new Date() }
    });
  }

  /**
   * Obtém empresas que converteram para pago
   */
  private async getConvertedToPaid(startDate: Date, endDate: Date): Promise<number> {
    const Payment = this.getPayment();
    const result = await Payment.aggregate([
      {
        $match: {
          status: 'paid',
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: '$companyId',
          firstPayment: { $min: '$createdAt' },
          count: { $sum: 1 }
        }
      },
      {
        $match: {
          count: { $gte: 1 }
        }
      },
      {
        $count: 'total'
      }
    ]);

    return result.length > 0 ? result[0].total : 0;
  }

  /**
   * Obtém assinaturas ativas
   */
  private async getActiveSubscriptions(): Promise<number> {
    const Subscription = this.getSubscription();
    return Subscription.countDocuments({
      status: { $in: ['active', 'trialing'] }
    });
  }

  /**
   * Obtém churns no período
   */
  private async getChurned(startDate: Date, endDate: Date): Promise<number> {
    const Subscription = this.getSubscription();
    return Subscription.countDocuments({
      status: 'cancelled',
      updatedAt: { $gte: startDate, $lte: endDate }
    });
  }

  /**
   * Obtém trials expirados
   */
  private async getTrialExpired(startDate: Date, endDate: Date): Promise<number> {
    const Subscription = this.getSubscription();
    return Subscription.countDocuments({
      status: 'expired',
      updatedAt: { $gte: startDate, $lte: endDate }
    });
  }

  /**
   * Obtém ticket médio
   */
  private async getAverageTicket(convertedToPaid: number): Promise<number> {
    if (convertedToPaid === 0) return 0;

    const Payment = this.getPayment();
    const result = await Payment.aggregate([
      {
        $match: {
          status: 'paid'
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    if (result.length === 0) return 0;
    return result[0].total / result[0].count;
  }
}

/**
 * Instância única do serviço (singleton)
 */
export const funnelAnalyticsService = new FunnelAnalyticsService();
export default funnelAnalyticsService;