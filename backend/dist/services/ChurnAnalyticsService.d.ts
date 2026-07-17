/**
 * ============================================
 * CHURN ANALYTICS SERVICE
 * ============================================
 *
 * Serviço responsável por calcular métricas de churn
 * e retenção para o sistema de funil de conversão.
 *
 * @module ChurnAnalyticsService
 * @since v30.0
 */
import { ChurnMetrics, ChurnedClient, ChurnByPlan } from '../types/analytics.types';
export declare class ChurnAnalyticsService {
    /**
     * Obtém métricas completas de churn para um período
     */
    getChurnMetrics(startDate: Date, endDate: Date): Promise<ChurnMetrics>;
    /**
     * Obtém churn agrupado por plano
     */
    getChurnByPlan(startDate: Date, endDate: Date): Promise<ChurnByPlan[]>;
    /**
     * Obtém curva de retenção para um período
     */
    getRetentionCurve(startDate: Date, endDate: Date, maxMonths?: number): Promise<{
        months: number[];
        retentionRates: number[];
        churnRates: number[];
        survivingClients: number[];
    }>;
    /**
     * Obtém lista de clientes churnados
     */
    getChurnedClientsList(startDate: Date, endDate: Date): Promise<ChurnedClient[]>;
    /**
     * Predição simples de churn baseada em dados históricos
     */
    getChurnPrediction(): Promise<{
        riskLevel: 'low' | 'medium' | 'high';
        predictedChurnRate: number;
        atRiskClients: {
            companyId: string;
            companyName: string;
            riskScore: number;
            reason: string;
        }[];
        recommendations: string[];
    }>;
    /**
     * Sugere estratégias de retenção baseadas em dados
     */
    getRetentionStrategies(startDate: Date, endDate: Date): Promise<{
        strategies: {
            name: string;
            description: string;
            priority: 'high' | 'medium' | 'low';
            expectedImpact: string;
        }[];
        quickWins: string[];
    }>;
    /**
     * Obtém total de churns no período
     */
    private getTotalChurned;
    /**
     * Obtém total de clientes ativos
     */
    private getTotalActive;
    /**
     * Obtém total de clientes (histórico)
     */
    private getTotalClients;
    /**
     * Obtém tempo médio de vida em meses
     */
    private getAverageLifetimeMonths;
}
/**
 * Instância única do serviço (singleton)
 */
export declare const churnAnalyticsService: ChurnAnalyticsService;
//# sourceMappingURL=ChurnAnalyticsService.d.ts.map