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
import { FunnelMetrics, FunnelDetails, ClientListItem, StatusDistribution, ClientFunnelStatus } from '../types/analytics.types';
export declare class FunnelAnalyticsService {
    private getCompany;
    private getSubscription;
    private getPayment;
    private getUser;
    private getPlan;
    /**
     * Obtém métricas completas do funil para um período
     */
    getFunnelMetrics(startDate: Date, endDate: Date): Promise<FunnelMetrics>;
    /**
     * Obtém detalhamento completo do funil com etapas
     */
    getFunnelDetails(startDate: Date, endDate: Date): Promise<FunnelDetails>;
    /**
     * Obtém lista de clientes com status no funil
     */
    getClientList(startDate: Date, endDate: Date, filters?: {
        plan?: string;
        status?: ClientFunnelStatus;
        search?: string;
        limit?: number;
        offset?: number;
    }): Promise<{
        clients: ClientListItem[];
        total: number;
        page: number;
        limit: number;
    }>;
    /**
     * Obtém distribuição de status dos clientes
     */
    getStatusDistribution(startDate: Date, endDate: Date): Promise<StatusDistribution[]>;
    /**
     * Obtém trials abandonados (não converteram após 7 dias)
     */
    getAbandonedTrials(startDate: Date, endDate: Date): Promise<{
        total: number;
        clients: {
            companyId: string;
            companyName: string;
            trialStart: Date;
            trialEnd: Date;
            daysActive: number;
        }[];
    }>;
    /**
     * Obtém tendência de conversão ao longo do tempo
     */
    getConversionTrend(startDate: Date, endDate: Date, interval?: 'daily' | 'weekly' | 'monthly'): Promise<{
        periods: string[];
        registrations: number[];
        conversions: number[];
        conversionRates: number[];
    }>;
    /**
     * Determina o status de uma empresa no funil
     * 🔴 CORRIGIDO: Considera o campo 'plan' da Company
     */
    private determineFunnelStatus;
    /**
     * Obtém total de registros (TODAS as empresas cadastradas)
     */
    private getTotalRegistrations;
    /**
     * Obtém trials ativos
     */
    private getActiveTrials;
    /**
     * Obtém empresas que converteram para pago
     */
    private getConvertedToPaid;
    /**
     * Obtém assinaturas ativas
     * 🔴 CORRIGIDO: Conta empresas com plano ativo
     */
    private getActiveSubscriptions;
    /**
     * Obtém churns no período
     */
    private getChurned;
    /**
     * Obtém trials expirados
     */
    private getTrialExpired;
    /**
     * Obtém ticket médio
     */
    private getAverageTicket;
}
/**
 * Instância única do serviço (singleton)
 */
export declare const funnelAnalyticsService: FunnelAnalyticsService;
export default funnelAnalyticsService;
//# sourceMappingURL=FunnelAnalyticsService.d.ts.map