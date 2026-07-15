/**
 * ============================================
 * ANALYTICS TYPES - FRONTEND
 * ============================================
 * 
 * Este arquivo contém todos os tipos e interfaces
 * para o sistema de análise de funil de conversão
 * no frontend.
 * 
 * @module AnalyticsTypes
 * @since v30.0
 */

// ============================================
// 1. PERÍODOS
// ============================================

export type AnalyticsPeriod = '30d' | '90d' | 'custom';

export interface PeriodConfig {
  startDate: Date;
  endDate: Date;
  label: string;
  type: AnalyticsPeriod;
}

// ============================================
// 2. MÉTRICAS DE RECEITA
// ============================================

export interface RevenueMetrics {
  totalRevenue: number;
  mrr: number;
  arr: number;
  arpu: number;
  ltv: number;
  revenueByPeriod: RevenueByPeriod[];
  revenueByPlan: RevenueByPlan[];
  growthPercent: number;
}

export interface RevenueByPeriod {
  period: string;
  total: number;
  date: Date;
}

export interface RevenueByPlan {
  planName: string;
  total: number;
  count: number;
  percentage: number;
  color?: string;
}

// ============================================
// 3. MÉTRICAS DE FUNIL
// ============================================

export interface FunnelMetrics {
  totalRegistrations: number;
  activeTrials: number;
  convertedToPaid: number;
  activeSubscriptions: number;
  churned: number;
  conversionRate: number;
  abandonmentRate: number;
  trialExpired: number;
  averageTicket: number;
}

export interface FunnelStep {
  step: 'registrations' | 'trials' | 'conversions' | 'active';
  label: string;
  count: number;
  percentage: number;
  color: string;
}

export interface FunnelDetails {
  steps: FunnelStep[];
  metrics: FunnelMetrics;
}

// ============================================
// 4. MÉTRICAS DE CHURN
// ============================================

export interface ChurnMetrics {
  churnRate: number;
  retentionRate: number;
  averageLifetimeMonths: number;
  totalChurned: number;
  totalActive: number;
  totalClients: number;
  churnedClients: ChurnedClient[];
  churnByPlan: ChurnByPlan[];
}

export interface ChurnedClient {
  companyId: string;
  companyName: string;
  planName: string;
  joinedAt: Date;
  churnedAt: Date;
  lifetimeDays: number;
  reason?: string;
  monthlyValue: number;
}

export interface ChurnByPlan {
  planName: string;
  total: number;
  churned: number;
  churnRate: number;
}

// ============================================
// 5. STATUS DOS CLIENTES
// ============================================

export type ClientFunnelStatus =
  | 'registered'
  | 'trialing'
  | 'trial_expired'
  | 'converted'
  | 'active'
  | 'past_due'
  | 'cancelled'
  | 'churned';

export interface ClientListItem {
  id: string;
  name: string;
  document?: string;
  planName: string;
  funnelStatus: ClientFunnelStatus;
  subscriptionStatus: string;
  joinedAt: Date;
  lastLogin?: Date;
  monthlyValue: number;
  totalPaid: number;
  nextBilling?: Date;
  userCount: number;
}

// ============================================
// 6. DISTRIBUIÇÕES
// ============================================

export interface PlanDistribution {
  planName: string;
  count: number;
  percentage: number;
}

export interface StatusDistribution {
  status: ClientFunnelStatus;
  label: string;
  count: number;
  percentage: number;
  color: string;
}

// ============================================
// 7. RESUMO COMPLETO
// ============================================

export interface AnalyticsSummary {
  revenue: RevenueMetrics;
  funnel: FunnelMetrics;
  churn: ChurnMetrics;
  planDistribution: PlanDistribution[];
  statusDistribution: StatusDistribution[];
  recentClients: ClientListItem[];
  period: PeriodConfig;
  generatedAt: Date;
}

// ============================================
// 8. PREDIÇÃO E ESTRATÉGIAS
// ============================================

export interface ChurnPrediction {
  riskLevel: 'low' | 'medium' | 'high';
  predictedChurnRate: number;
  atRiskClients: {
    companyId: string;
    companyName: string;
    riskScore: number;
    reason: string;
  }[];
  recommendations: string[];
}

export interface RetentionStrategies {
  strategies: {
    name: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
    expectedImpact: string;
  }[];
  quickWins: string[];
}

// ============================================
// 9. TENDÊNCIA E RETENÇÃO
// ============================================

export interface ConversionTrend {
  periods: string[];
  registrations: number[];
  conversions: number[];
  conversionRates: number[];
}

export interface RetentionCurve {
  months: number[];
  retentionRates: number[];
  churnRates: number[];
  survivingClients: number[];
}

// ============================================
// 10. RESPOSTAS DA API
// ============================================

export interface AnalyticsApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  statusCode: number;
}

// ============================================
// 11. CONSTANTES E ENUMS
// ============================================

export const FunnelStatusLabels: Record<ClientFunnelStatus, string> = {
  registered: 'Cadastrado',
  trialing: 'Em Trial',
  trial_expired: 'Trial Expirado',
  converted: 'Convertido',
  active: 'Ativo',
  past_due: 'Pagamento em Atraso',
  cancelled: 'Cancelado',
  churned: 'Desistiu'
};

export const FunnelStatusColors: Record<ClientFunnelStatus, string> = {
  registered: '#6B7280',
  trialing: '#3B82F6',
  trial_expired: '#F59E0B',
  converted: '#10B981',
  active: '#059669',
  past_due: '#EF4444',
  cancelled: '#6B7280',
  churned: '#DC2626'
};

export const PlanColors: Record<string, string> = {
  'Básico': '#6B7280',
  'Profissional': '#3B82F6',
  'Enterprise': '#8B5CF6',
  'Basic': '#6B7280',
  'Pro': '#3B82F6'
};

export const ChartColors = [
  '#3B82F6',
  '#10B981',
  '#8B5CF6',
  '#F59E0B',
  '#EF4444',
  '#06B6D4',
  '#F472B6',
  '#6366F1'
];