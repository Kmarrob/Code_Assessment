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
    getPeriodComparison(currentStart: Date, currentEnd: Date, previousStart: Date, previousEnd: Date): Promise<{
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
            totalRevenue: {
                amount: number;
                percent: number;
            };
            mrr: {
                amount: number;
                percent: number;
            };
            arpu: {
                amount: number;
                percent: number;
            };
            activeClients: {
                amount: number;
                percent: number;
            };
        };
        trend: 'up' | 'down' | 'stable';
    }>;
    getRevenueForecast(startDate: Date, endDate: Date, monthsToForecast?: number): Promise<{
        historical: {
            period: string;
            revenue: number;
        }[];
        forecast: {
            optimistic: {
                period: string;
                revenue: number;
            }[];
            realistic: {
                period: string;
                revenue: number;
            }[];
            pessimistic: {
                period: string;
                revenue: number;
            }[];
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
    }>;
}
export declare const revenueAnalyticsService: RevenueAnalyticsService;
export default revenueAnalyticsService;
//# sourceMappingURL=RevenueAnalyticsService.d.ts.map