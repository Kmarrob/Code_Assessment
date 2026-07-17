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
import { RevenueMetrics, RevenueByPeriod, PeriodConfig } from '../types/analytics.types';
export declare class RevenueAnalyticsService {
    private getPayment;
    private getSubscription;
    private getPlan;
    private getCompany;
    getRevenueMetrics(startDate: Date, endDate: Date): Promise<RevenueMetrics>;
    private getTotalRevenue;
    private calculateRevenueFromPlans;
    private getPreviousPeriodRevenue;
    getMRR(): Promise<number>;
    private calculateMRRFromPlans;
    private getARPU;
    private getAverageLifetime;
    private getRevenueByPeriod;
    private generateRevenueByPeriodFromPlans;
    private getRevenueByPlan;
    private calculateRevenueByPlanFromCompanies;
    getRevenueByPeriodCustom(startDate: Date, endDate: Date, interval?: 'daily' | 'weekly' | 'monthly'): Promise<RevenueByPeriod[]>;
    getRevenueMetricsForPeriod(periodConfig: PeriodConfig): Promise<RevenueMetrics>;
    getRevenueGrowth(currentStart: Date, currentEnd: Date, previousStart: Date, previousEnd: Date): Promise<{
        currentRevenue: number;
        previousRevenue: number;
        growthAmount: number;
        growthPercent: number;
    }>;
    getFinancialHealth(startDate: Date, endDate: Date): Promise<{
        status: 'healthy' | 'warning' | 'critical';
        metrics: {
            mrr: number;
            churnRate: number;
            arpu: number;
            revenueGrowth: number;
        };
        message: string;
    }>;
}
export declare const revenueAnalyticsService: RevenueAnalyticsService;
export default revenueAnalyticsService;
//# sourceMappingURL=RevenueAnalyticsService.d.ts.map