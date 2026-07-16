/**
 * ============================================
 * ANALYTICS TYPES - SISTEMA DE FUNIL DE CONVERSÃO
 * ============================================
 * 
 * Este arquivo contém todos os tipos e interfaces
 * para o sistema de análise de funil de conversão
 * da área administrativa.
 * 
 * @module AnalyticsTypes
 * @since v30.0
 */

// ============================================
// 1. PERÍODOS
// ============================================

/**
 * Períodos predefinidos para análise
 */
export type AnalyticsPeriod = '30d' | '90d' | 'custom';

/**
 * Configuração de período para consultas
 */
export interface PeriodConfig {
  /** Data de início do período */
  startDate: Date;
  /** Data de fim do período */
  endDate: Date;
  /** Label do período (ex: "Últimos 30 dias") */
  label: string;
  /** Tipo de período */
  type: AnalyticsPeriod;
}

// ============================================
// 2. MÉTRICAS DE RECEITA (REVENUE)
// ============================================

/**
 * Métricas de receita consolidadas
 */
export interface RevenueMetrics {
  /** Receita total no período (R$) */
  totalRevenue: number;
  
  /** Receita recorrente mensal (MRR) */
  mrr: number;
  
  /** Receita anual recorrente (ARR) */
  arr: number;
  
  /** Receita média por empresa ativa (ARPU) */
  arpu: number;
  
  /** Lifetime Value estimado */
  ltv: number;
  
  /** Receita por período (ex: por mês) */
  revenueByPeriod: RevenueByPeriod[];
  
  /** Receita por plano */
  revenueByPlan: RevenueByPlan[];
  
  /** Crescimento percentual em relação ao período anterior */
  growthPercent: number;
}

/**
 * Receita agrupada por período
 */
export interface RevenueByPeriod {
  /** Label do período (ex: "Julho 2026") */
  period: string;
  /** Valor total no período */
  total: number;
  /** Data de referência */
  date: Date;
}

/**
 * Receita agrupada por plano
 */
export interface RevenueByPlan {
  /** Nome do plano (Basic, Pro, Enterprise) */
  planName: string;
  /** Receita total do plano */
  total: number;
  /** Quantidade de empresas neste plano */
  count: number;
  /** Percentual da receita total */
  percentage: number;
}

// ============================================
// 3. MÉTRICAS DE FUNIL (FUNNEL)
// ============================================

/**
 * Métricas de funil de conversão
 */
export interface FunnelMetrics {
  /** Total de empresas cadastradas no período */
  totalRegistrations: number;
  
  /** Empresas em período de trial */
  activeTrials: number;
  
  /** Empresas que converteram para pago */
  convertedToPaid: number;
  
  /** Empresas ativas (pagando) */
  activeSubscriptions: number;
  
  /** Empresas que cancelaram no período */
  churned: number;
  
  /** Taxa de conversão (%) = (convertedToPaid / totalRegistrations) * 100 */
  conversionRate: number;
  
  /** Taxa de abandono (%) = (trialExpired / totalRegistrations) * 100 */
  abandonmentRate: number;
  
  /** Empresas que tiveram trial expirado sem conversão */
  trialExpired: number;
  
  /** Ticket médio por conversão (R$) */
  averageTicket: number;
}

/**
 * Dados do funil para visualização
 */
export interface FunnelStep {
  /** Nome da etapa */
  step: 'registrations' | 'trials' | 'conversions' | 'active';
  
  /** Label amigável */
  label: string;
  
  /** Quantidade de empresas */
  count: number;
  
  /** Percentual da etapa anterior */
  percentage: number;
  
  /** Cor para exibição */
  color: string;
}

/**
 * Detalhamento de cada etapa do funil
 */
export interface FunnelDetails {
  /** Etapas do funil */
  steps: FunnelStep[];
  
  /** Métricas consolidadas */
  metrics: FunnelMetrics;
}

// ============================================
// 4. MÉTRICAS DE CHURN E RETENÇÃO
// ============================================

/**
 * Métricas de churn e retenção
 */
export interface ChurnMetrics {
  /** Taxa de churn (%) */
  churnRate: number;
  
  /** Taxa de retenção (%) */
  retentionRate: number;
  
  /** Tempo médio de vida do cliente (meses) */
  averageLifetimeMonths: number;
  
  /** Total de clientes churnados no período */
  totalChurned: number;
  
  /** Total de clientes ativos */
  totalActive: number;
  
  /** Total de clientes (histórico) */
  totalClients: number;
  
  /** Lista de clientes churnados */
  churnedClients: ChurnedClient[];
  
  /** Churn por plano */
  churnByPlan: ChurnByPlan[];
}

/**
 * Cliente que desistiu (churn)
 */
export interface ChurnedClient {
  /** ID da empresa */
  companyId: string;
  
  /** Nome da empresa */
  companyName: string;
  
  /** Plano que estava */
  planName: string;
  
  /** Data de entrada (cadastro) */
  joinedAt: Date;
  
  /** Data de saída (churn) */
  churnedAt: Date;
  
  /** Tempo como cliente (dias) */
  lifetimeDays: number;
  
  /** Motivo (se disponível) */
  reason?: string;
  
  /** Valor que pagava */
  monthlyValue: number;
}

/**
 * Churn agrupado por plano
 */
export interface ChurnByPlan {
  /** Nome do plano */
  planName: string;
  
  /** Total de empresas no plano */
  total: number;
  
  /** Total de churn no plano */
  churned: number;
  
  /** Taxa de churn do plano (%) */
  churnRate: number;
}

// ============================================
// 5. STATUS DOS CLIENTES
// ============================================

/**
 * Status de uma empresa no funil de conversão
 */
export type ClientFunnelStatus = 
  | 'registered'      // Cadastrou, sem assinatura
  | 'trialing'        // Em período de trial
  | 'trial_expired'   // Trial expirou sem conversão
  | 'converted'       // Converteu para pago
  | 'active'          // Ativa e pagando
  | 'past_due'        // Pagamento em atraso
  | 'cancelled'       // Cancelou
  | 'churned';        // Desistiu (churn)

/**
 * Item da lista de clientes
 */
export interface ClientListItem {
  /** ID da empresa */
  id: string;
  
  /** Nome da empresa */
  name: string;
  
  /** CNPJ (se disponível) */
  document?: string;
  
  /** Plano atual */
  planName: string;
  
  /** Status no funil */
  funnelStatus: ClientFunnelStatus;
  
  /** Status da assinatura */
  subscriptionStatus: string;
  
  /** Data de entrada */
  joinedAt: Date;
  
  /** Data do último login */
  lastLogin?: Date;
  
  /** Valor mensal (R$) */
  monthlyValue: number;
  
  /** Total pago (histórico) */
  totalPaid: number;
  
  /** Próximo vencimento (se ativo) */
  nextBilling?: Date;
  
  /** Número de usuários ativos */
  userCount: number;
}

// ============================================
// 6. RESUMO COMPLETO (DASHBOARD)
// ============================================

/**
 * Resumo completo do analytics para o dashboard
 */
export interface AnalyticsSummary {
  /** Métricas de receita */
  revenue: RevenueMetrics;
  
  /** Métricas de funil */
  funnel: FunnelMetrics;
  
  /** Métricas de churn */
  churn: ChurnMetrics;
  
  /** Distribuição por plano */
  planDistribution: PlanDistribution[];
  
  /** Status das empresas */
  statusDistribution: StatusDistribution[];
  
  /** Últimos clientes (página inicial) */
  recentClients: ClientListItem[];
  
  /** Período analisado */
  period: PeriodConfig;
  
  /** Data da geração */
  generatedAt: Date;
}

/**
 * Distribuição por plano
 */
export interface PlanDistribution {
  /** Nome do plano */
  planName: string;
  
  /** Quantidade de empresas */
  count: number;
  
  /** Percentual do total */
  percentage: number;
}

/**
 * Distribuição por status
 */
export interface StatusDistribution {
  /** Status */
  status: ClientFunnelStatus;
  
  /** Label amigável */
  label: string;
  
  /** Quantidade */
  count: number;
  
  /** Percentual */
  percentage: number;
  
  /** Cor para exibição */
  color: string;
}

// ============================================
// 7. PARÂMETROS DE CONSULTA
// ============================================

/**
 * Parâmetros para consulta de analytics
 */
export interface AnalyticsQueryParams {
  /** Período predefinido */
  period: AnalyticsPeriod;
  
  /** Data personalizada - início */
  startDate?: Date;
  
  /** Data personalizada - fim */
  endDate?: Date;
  
  /** Filtrar por plano específico */
  plan?: string;
  
  /** Filtrar por status específico */
  status?: ClientFunnelStatus;
}

// ============================================
// 8. EXPORTAÇÃO DE RELATÓRIOS
// ============================================

/**
 * Configuração para exportação de relatório
 */
export interface ExportConfig {
  /** Formato de exportação */
  format: 'csv' | 'excel' | 'pdf';
  
  /** Dados a serem exportados */
  sections: ('revenue' | 'funnel' | 'churn' | 'clients')[];
  
  /** Período a ser exportado */
  period: AnalyticsQueryParams;
  
  /** Nome do arquivo */
  filename?: string;
}

/**
 * Dados exportados
 */
export interface ExportData {
  /** Nome do arquivo */
  filename: string;
  
  /** Conteúdo (CSV ou binário para Excel) */
  content: string | Buffer;
  
  /** Tipo MIME */
  mimeType: string;
}

// ============================================
// 9. RESPOSTAS DA API
// ============================================

/**
 * Resposta padrão da API de analytics
 */
export interface AnalyticsApiResponse<T> {
  /** Sucesso da operação */
  success: boolean;
  
  /** Dados da resposta */
  data?: T;
  
  /** Mensagem de erro (se houver) */
  error?: string;
  
  /** Código HTTP */
  statusCode: number;
}

// ============================================
// 10. ENUMS E CONSTANTES
// ============================================

/**
 * Labels amigáveis para status
 */
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

/**
 * Cores por status
 */
export const FunnelStatusColors: Record<ClientFunnelStatus, string> = {
  registered: '#6B7280',      // gray
  trialing: '#3B82F6',        // blue
  trial_expired: '#F59E0B',   // yellow
  converted: '#10B981',       // green
  active: '#059669',          // emerald
  past_due: '#EF4444',        // red
  cancelled: '#6B7280',       // gray
  churned: '#DC2626'          // red-dark
};

/**
 * Cores por plano
 * 🔴 CORRIGIDO: Removida duplicata 'Enterprise'
 */
export const PlanColors: Record<string, string> = {
  'Básico': '#6B7280',
  'Profissional': '#3B82F6',
  'Enterprise': '#8B5CF6',
  'Basic': '#6B7280',
  'Pro': '#3B82F6'
};

/**
 * Cores para gráficos
 */
export const ChartColors = [
  '#3B82F6', // blue
  '#10B981', // green
  '#8B5CF6', // purple
  '#F59E0B', // yellow
  '#EF4444', // red
  '#06B6D4', // cyan
  '#F472B6', // pink
  '#6366F1', // indigo
];

// ============================================
// 🔴 NOVO: FASE 7 - COMPARAÇÃO DE PERÍODOS
// ============================================

/**
 * Métricas de comparação entre períodos
 */
export interface PeriodComparison {
  /** Métricas do período atual */
  current: PeriodMetrics;
  /** Métricas do período anterior */
  previous: PeriodMetrics;
  /** Mudanças entre os períodos */
  changes: PeriodChanges;
  /** Tendência geral: up, down, stable */
  trend: 'up' | 'down' | 'stable';
}

/**
 * Métricas de um período específico para comparação
 */
export interface PeriodMetrics {
  totalRevenue: number;
  mrr: number;
  arpu: number;
  activeClients: number;
}

/**
 * Mudanças entre períodos
 */
export interface PeriodChanges {
  totalRevenue: ChangeMetric;
  mrr: ChangeMetric;
  arpu: ChangeMetric;
  activeClients: ChangeMetric;
}

/**
 * Métrica de mudança
 */
export interface ChangeMetric {
  /** Mudança absoluta */
  amount: number;
  /** Mudança percentual */
  percent: number;
}

// ============================================
// 🔴 NOVO: FASE 7 - PREVISÃO DE RECEITA
// ============================================

/**
 * Previsão de receita
 */
export interface RevenueForecast {
  /** Dados históricos */
  historical: ForecastDataPoint[];
  /** Previsões por cenário */
  forecast: {
    optimistic: ForecastDataPoint[];
    realistic: ForecastDataPoint[];
    pessimistic: ForecastDataPoint[];
  };
  /** Resumo da previsão */
  summary: ForecastSummary;
}

/**
 * Ponto de dados da previsão
 */
export interface ForecastDataPoint {
  /** Período (ex: "Julho 2026") */
  period: string;
  /** Valor previsto */
  revenue: number;
}

/**
 * Resumo da previsão de receita
 */
export interface ForecastSummary {
  /** MRR atual */
  currentMRR: number;
  /** MRR projetado por cenário */
  projectedMRR: {
    optimistic: number;
    realistic: number;
    pessimistic: number;
  };
  /** Taxa de crescimento por cenário (%) */
  growthRate: {
    optimistic: number;
    realistic: number;
    pessimistic: number;
  };
}