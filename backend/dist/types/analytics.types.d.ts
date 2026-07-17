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
/**
 * Status de uma empresa no funil de conversão
 */
export type ClientFunnelStatus = 'registered' | 'trialing' | 'trial_expired' | 'converted' | 'active' | 'past_due' | 'cancelled' | 'churned';
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
/**
 * Labels amigáveis para status
 */
export declare const FunnelStatusLabels: Record<ClientFunnelStatus, string>;
/**
 * Cores por status
 */
export declare const FunnelStatusColors: Record<ClientFunnelStatus, string>;
/**
 * Cores por plano
 * 🔴 CORRIGIDO: Removida duplicata 'Enterprise'
 */
export declare const PlanColors: Record<string, string>;
/**
 * Cores para gráficos
 */
export declare const ChartColors: string[];
//# sourceMappingURL=analytics.types.d.ts.map