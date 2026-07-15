// frontend/src/services/subscription.service.ts
import api from './api.js';
import { ApiResponse } from '../types/index.js';
import { Plan, PlanFeature } from './plan.service.js';

export type SubscriptionStatus = 
  | 'trial'
  | 'active'
  | 'past_due'
  | 'suspended'
  | 'cancelled'
  | 'expired'
  | 'pending'
  | 'trialing';

export interface Subscription {
  _id: string;
  companyId: string;
  planId: string | Plan;
  userId: string;
  status: SubscriptionStatus;
  startDate: string;
  endDate: string;
  trialStartDate?: string;
  trialEndDate?: string;
  cancelledAt?: string;
  suspendedAt?: string;
  reactivatedAt?: string;
  lastPaymentDate?: string;
  nextPaymentDate?: string;
  amount: number;
  currency: 'BRL' | 'USD';
  billingCycle: 'monthly' | 'annual';
  autoRenew: boolean;
  maxUsers: number;
  currentUsers: number;
  features: PlanFeature;
  consultingHoursTotal: number;
  consultingHoursUsed: number;
  consultingHoursRemaining: number;
  paymentMethod?: 'credit_card' | 'boleto' | 'pix' | 'bank_transfer';
  paymentProvider?: 'stripe' | 'pagseguro' | 'mercadopago' | 'manual';
  paymentId?: string;
  subscriptionId?: string;
  changeHistory: Array<{
    fromPlan: string;
    toPlan: string;
    changedAt: string;
    changedBy: string;
    reason?: string;
  }>;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionStatusResult {
  isActive: boolean;
  status: SubscriptionStatus;
  daysUntilExpiration: number;
  daysUntilTrialEnd: number;
  isOnTrial: boolean;
  isExpired: boolean;
  isSuspended: boolean;
}

export interface CreateSubscriptionData {
  planId: string;
  billingCycle: 'monthly' | 'annual';
  autoRenew?: boolean;
  paymentMethod?: 'credit_card' | 'boleto' | 'pix' | 'bank_transfer';
  paymentProvider?: 'stripe' | 'pagseguro' | 'mercadopago' | 'manual';
  paymentId?: string;
  subscriptionId?: string;
  notes?: string;
}

export interface UpdateSubscriptionData {
  status?: SubscriptionStatus;
  planId?: string;
  autoRenew?: boolean;
  maxUsers?: number;
  currentUsers?: number;
  consultingHoursUsed?: number;
  notes?: string;
}

export interface SubscriptionMetrics {
  total: number;
  active: number;
  trial: number;
  suspended: number;
  cancelled: number;
  expired: number;
  byPlan: Record<string, number>;
  monthlyRevenue: number;
  annualRevenue: number;
}

export const subscriptionService = {
  /**
   * Criar nova assinatura
   * POST /api/subscriptions
   */
  async createSubscription(data: CreateSubscriptionData): Promise<Subscription> {
    const response = await api.post<ApiResponse<{ subscription: Subscription }>>(
      '/subscriptions',
      data
    );
    return response.data.data.subscription;
  },

  /**
   * Obter assinatura ativa da empresa
   * GET /api/subscriptions/active
   */
  async getActiveSubscription(): Promise<{ subscription: Subscription | null; status: SubscriptionStatusResult }> {
    const response = await api.get<ApiResponse<{ subscription: Subscription | null; status: SubscriptionStatusResult }>>(
      '/subscriptions/active'
    );
    return response.data.data;
  },

  /**
   * 🔴 NOVO: Obter assinatura ativa de uma empresa específica (admin)
   * GET /api/subscriptions/admin/:companyId
   */
  async getActiveSubscriptionByCompany(companyId: string): Promise<{ subscription: Subscription | null; status: SubscriptionStatusResult }> {
    const response = await api.get<ApiResponse<{ subscription: Subscription | null; status: SubscriptionStatusResult }>>(
      `/subscriptions/admin/${companyId}`
    );
    return response.data.data;
  },

  /**
   * Obter histórico de assinaturas da empresa
   * GET /api/subscriptions/history
   */
  async getSubscriptionHistory(): Promise<Subscription[]> {
    const response = await api.get<ApiResponse<{ history: Subscription[] }>>(
      '/subscriptions/history'
    );
    return response.data.data.history;
  },

  /**
   * Verificar status da assinatura
   * GET /api/subscriptions/status
   */
  async checkStatus(): Promise<SubscriptionStatusResult> {
    const response = await api.get<ApiResponse<SubscriptionStatusResult>>(
      '/subscriptions/status'
    );
    return response.data.data;
  },

  /**
   * Atualizar assinatura (admin)
   * PUT /api/subscriptions/:id
   */
  async updateSubscription(id: string, data: UpdateSubscriptionData): Promise<Subscription> {
    const response = await api.put<ApiResponse<{ subscription: Subscription }>>(
      `/subscriptions/${id}`,
      data
    );
    return response.data.data.subscription;
  },

  /**
   * Cancelar assinatura
   * POST /api/subscriptions/:id/cancel
   */
  async cancelSubscription(id: string, reason?: string): Promise<Subscription> {
    const response = await api.post<ApiResponse<{ subscription: Subscription }>>(
      `/subscriptions/${id}/cancel`,
      { reason }
    );
    return response.data.data.subscription;
  },

  /**
   * Obter métricas de assinaturas (admin)
   * GET /api/admin/subscriptions/metrics
   */
  async getMetrics(): Promise<SubscriptionMetrics> {
    const response = await api.get<ApiResponse<SubscriptionMetrics>>(
      '/admin/subscriptions/metrics'
    );
    return response.data.data;
  },

  /**
   * 🔴 CORRIGIDO: Atualizar assinatura com base no plano da empresa
   * Busca a assinatura ativa da empresa e atualiza para o novo plano
   */
  async updateSubscriptionByCompany(companyId: string, planName: string): Promise<Subscription | null> {
    try {
      // 🔴 CORRIGIDO: Usar a nova rota admin
      const { subscription } = await this.getActiveSubscriptionByCompany(companyId);
      
      if (!subscription) {
        console.warn(`Nenhuma assinatura ativa encontrada para a empresa ${companyId}`);
        return null;
      }

      // 2. Buscar o ID do plano pelo nome
      const plansResponse = await api.get<ApiResponse<{ plans: Plan[] }>>('/plans/public');
      const plans = plansResponse.data.data.plans || [];
      const plan = plans.find(p => p.name === planName);

      if (!plan) {
        console.warn(`Plano ${planName} não encontrado`);
        return null;
      }

      // 3. Atualizar a assinatura com o novo plano
      const updatedSubscription = await this.updateSubscription(subscription._id, {
        planId: plan._id,
      });

      return updatedSubscription;
    } catch (error) {
      console.error('Erro ao atualizar assinatura por empresa:', error);
      return null;
    }
  },

  /**
   * Verificar se a assinatura está ativa
   */
  isActive(subscription: Subscription | null): boolean {
    if (!subscription) return false;
    return subscription.status === 'active' || 
           subscription.status === 'trial' || 
           subscription.status === 'trialing';
  },

  /**
   * Verificar se está em período de teste
   */
  isOnTrial(subscription: Subscription | null): boolean {
    if (!subscription) return false;
    return subscription.status === 'trial' || subscription.status === 'trialing';
  },

  /**
   * Verificar se a assinatura está suspensa
   */
  isSuspended(subscription: Subscription | null): boolean {
    if (!subscription) return false;
    return subscription.status === 'suspended';
  },

  /**
   * Verificar se a assinatura está cancelada
   */
  isCancelled(subscription: Subscription | null): boolean {
    if (!subscription) return false;
    return subscription.status === 'cancelled';
  },

  /**
   * Verificar se a assinatura expirou
   */
  isExpired(subscription: Subscription | null): boolean {
    if (!subscription) return true;
    if (subscription.status === 'expired') return true;
    if (!subscription.endDate) return true;
    return new Date(subscription.endDate) < new Date();
  },

  /**
   * Obter dias restantes para expiração
   */
  getDaysUntilExpiration(subscription: Subscription | null): number {
    if (!subscription || !subscription.endDate) return 0;
    const now = new Date();
    const end = new Date(subscription.endDate);
    const diff = end.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  },

  /**
   * Obter dias restantes do trial
   */
  getDaysUntilTrialEnd(subscription: Subscription | null): number {
    if (!subscription || !subscription.trialEndDate) return 0;
    const now = new Date();
    const end = new Date(subscription.trialEndDate);
    const diff = end.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  },

  /**
   * Obter status de forma legível
   */
  getStatusLabel(status: SubscriptionStatus): string {
    const statusMap: Record<SubscriptionStatus, string> = {
      'trial': 'Teste Gratuito',
      'active': 'Ativa',
      'past_due': 'Pagamento em Atraso',
      'suspended': 'Suspensa',
      'cancelled': 'Cancelada',
      'expired': 'Expirada',
      'pending': 'Aguardando Pagamento',
      'trialing': 'Em Teste',
    };
    return statusMap[status] || status;
  },

  /**
   * Obter cor do status
   */
  getStatusColor(status: SubscriptionStatus): string {
    const colorMap: Record<SubscriptionStatus, string> = {
      'trial': 'text-yellow-600 bg-yellow-50',
      'active': 'text-green-600 bg-green-50',
      'past_due': 'text-orange-600 bg-orange-50',
      'suspended': 'text-red-600 bg-red-50',
      'cancelled': 'text-gray-600 bg-gray-50',
      'expired': 'text-gray-400 bg-gray-50',
      'pending': 'text-blue-600 bg-blue-50',
      'trialing': 'text-yellow-600 bg-yellow-50',
    };
    return colorMap[status] || 'text-gray-600 bg-gray-50';
  },
};