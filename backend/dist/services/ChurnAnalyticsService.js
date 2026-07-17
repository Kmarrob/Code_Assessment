"use strict";
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.churnAnalyticsService = exports.ChurnAnalyticsService = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
// 🔴 CORRIGIDO: Usar mongoose.model para obter os modelos
const Subscription = mongoose_1.default.model('Subscription');
const Company = mongoose_1.default.model('Company');
const Payment = mongoose_1.default.model('Payment');
const Plan = mongoose_1.default.model('Plan');
class ChurnAnalyticsService {
    /**
     * Obtém métricas completas de churn para um período
     */
    async getChurnMetrics(startDate, endDate) {
        try {
            console.log('📊 Calculando métricas de churn', { startDate, endDate });
            const [totalChurned, totalActive, totalClients, churnedClients, churnByPlan, averageLifetime] = await Promise.all([
                this.getTotalChurned(startDate, endDate),
                this.getTotalActive(),
                this.getTotalClients(),
                this.getChurnedClientsList(startDate, endDate),
                this.getChurnByPlan(startDate, endDate),
                this.getAverageLifetimeMonths()
            ]);
            // Calcular taxas
            const churnRate = totalClients > 0
                ? (totalChurned / totalClients) * 100
                : 0;
            const retentionRate = 100 - churnRate;
            const metrics = {
                churnRate,
                retentionRate,
                averageLifetimeMonths: averageLifetime,
                totalChurned,
                totalActive,
                totalClients,
                churnedClients,
                churnByPlan
            };
            console.log('✅ Métricas de churn calculadas', {
                churnRate,
                retentionRate,
                totalChurned,
                totalActive
            });
            return metrics;
        }
        catch (error) {
            console.error('❌ Erro ao calcular métricas de churn:', error);
            throw error;
        }
    }
    /**
     * Obtém churn agrupado por plano
     */
    async getChurnByPlan(startDate, endDate) {
        try {
            // Buscar todos os planos
            const plans = await Plan.find({ isActive: true });
            const result = [];
            for (const plan of plans) {
                // Total de empresas neste plano
                const total = await Subscription.countDocuments({
                    planId: plan._id,
                    status: { $in: ['active', 'trialing', 'cancelled', 'past_due'] }
                });
                // Churns neste plano
                const churned = await Subscription.countDocuments({
                    planId: plan._id,
                    status: 'cancelled',
                    updatedAt: { $gte: startDate, $lte: endDate }
                });
                const churnRate = total > 0 ? (churned / total) * 100 : 0;
                result.push({
                    planName: plan.name,
                    total,
                    churned,
                    churnRate
                });
            }
            // Ordenar por taxa de churn (decrescente)
            result.sort((a, b) => b.churnRate - a.churnRate);
            console.log('📊 Churn por plano calculado', { result });
            return result;
        }
        catch (error) {
            console.error('❌ Erro ao calcular churn por plano:', error);
            return [];
        }
    }
    /**
     * Obtém curva de retenção para um período
     */
    async getRetentionCurve(startDate, endDate, maxMonths = 12) {
        try {
            const months = [];
            const retentionRates = [];
            const churnRates = [];
            const survivingClients = [];
            // Buscar todos os clientes que entraram no período
            const cohorts = await Company.find({
                createdAt: { $gte: startDate, $lte: endDate }
            });
            const totalCohort = cohorts.length;
            if (totalCohort === 0) {
                return { months: [], retentionRates: [], churnRates: [], survivingClients: [] };
            }
            // Para cada mês, calcular quantos ainda estão ativos
            for (let month = 0; month <= maxMonths; month++) {
                months.push(month);
                const dateLimit = new Date(startDate);
                dateLimit.setMonth(dateLimit.getMonth() + month);
                // Contar quantos da coorte ainda estão ativos após 'month' meses
                let surviving = 0;
                for (const company of cohorts) {
                    // Buscar assinatura ativa do cliente
                    const subscription = await Subscription.findOne({
                        companyId: company._id,
                        status: { $in: ['active', 'trialing'] }
                    });
                    if (subscription) {
                        // Verificar se a assinatura ainda está ativa após 'month' meses
                        const startPlusMonths = new Date(subscription.startDate);
                        startPlusMonths.setMonth(startPlusMonths.getMonth() + month);
                        if (startPlusMonths >= new Date()) {
                            surviving++;
                        }
                    }
                }
                const retentionRate = (surviving / totalCohort) * 100;
                const churnRate = 100 - retentionRate;
                retentionRates.push(retentionRate);
                churnRates.push(churnRate);
                survivingClients.push(surviving);
            }
            console.log('📊 Curva de retenção calculada', {
                totalCohort,
                months: months.length
            });
            return { months, retentionRates, churnRates, survivingClients };
        }
        catch (error) {
            console.error('❌ Erro ao calcular curva de retenção:', error);
            return { months: [], retentionRates: [], churnRates: [], survivingClients: [] };
        }
    }
    /**
     * Obtém lista de clientes churnados
     */
    async getChurnedClientsList(startDate, endDate) {
        try {
            // Buscar subscriptions canceladas no período
            const cancelledSubs = await Subscription.find({
                status: 'cancelled',
                updatedAt: { $gte: startDate, $lte: endDate }
            });
            const clients = [];
            for (const sub of cancelledSubs) {
                // Buscar empresa
                const company = await Company.findById(sub.companyId);
                if (!company)
                    continue;
                // Buscar plano
                const plan = await Plan.findById(sub.planId);
                const lifetimeDays = Math.floor((new Date().getTime() - sub.startDate.getTime()) / (1000 * 60 * 60 * 24));
                // Buscar último pagamento
                const lastPayment = await Payment.findOne({
                    subscriptionId: sub._id,
                    status: 'paid'
                }).sort({ createdAt: -1 });
                clients.push({
                    companyId: company._id.toString(),
                    companyName: company.name,
                    planName: plan?.name || 'Nenhum',
                    joinedAt: sub.startDate,
                    churnedAt: sub.updatedAt,
                    lifetimeDays,
                    monthlyValue: plan?.price || 0,
                    reason: undefined
                });
            }
            // Ordenar por data de churn (mais recentes primeiro)
            clients.sort((a, b) => b.churnedAt.getTime() - a.churnedAt.getTime());
            return clients;
        }
        catch (error) {
            console.error('❌ Erro ao buscar clientes churnados:', error);
            return [];
        }
    }
    /**
     * Predição simples de churn baseada em dados históricos
     */
    async getChurnPrediction() {
        try {
            const atRiskClients = [];
            // Buscar todas as empresas ativas
            const activeSubs = await Subscription.find({
                status: { $in: ['active', 'trialing'] }
            });
            // Para cada cliente ativo, calcular risco de churn
            for (const sub of activeSubs) {
                const company = await Company.findById(sub.companyId);
                if (!company)
                    continue;
                const plan = await Plan.findById(sub.planId);
                // Fatores de risco:
                // 1. Tempo desde o último pagamento
                const lastPayment = await Payment.findOne({
                    subscriptionId: sub._id,
                    status: 'paid'
                }).sort({ createdAt: -1 });
                let riskScore = 0;
                let reasons = [];
                if (lastPayment) {
                    const daysSinceLastPayment = Math.floor((new Date().getTime() - lastPayment.createdAt.getTime()) / (1000 * 60 * 60 * 24));
                    if (daysSinceLastPayment > 25) {
                        riskScore += 30;
                        reasons.push('Último pagamento há mais de 25 dias');
                    }
                    else if (daysSinceLastPayment > 20) {
                        riskScore += 15;
                        reasons.push('Último pagamento há mais de 20 dias');
                    }
                }
                // 4. Plano (Enterprise tem menor churn)
                if (plan?.name === 'Enterprise') {
                    riskScore -= 10;
                }
                else if (plan?.name === 'Basic') {
                    riskScore += 10;
                }
                // Calcular risco final (0-100)
                riskScore = Math.max(0, Math.min(100, riskScore));
                if (riskScore > 50) {
                    atRiskClients.push({
                        companyId: company._id.toString(),
                        companyName: company.name,
                        riskScore,
                        reason: reasons.join(', ') || 'Múltiplos fatores de risco'
                    });
                }
            }
            // Ordenar por risco (decrescente)
            atRiskClients.sort((a, b) => b.riskScore - a.riskScore);
            // Calcular taxa de churn prevista
            const predictedChurnRate = atRiskClients.length > 0
                ? (atRiskClients.length / activeSubs.length) * 100
                : 0;
            let riskLevel = 'low';
            if (predictedChurnRate > 20) {
                riskLevel = 'high';
            }
            else if (predictedChurnRate > 10) {
                riskLevel = 'medium';
            }
            // Recomendações baseadas no risco
            const recommendations = [];
            if (riskLevel === 'high') {
                recommendations.push('Implementar programa de retenção urgente');
                recommendations.push('Oferecer desconto para renovação antecipada');
                recommendations.push('Entrar em contato com clientes em risco');
            }
            else if (riskLevel === 'medium') {
                recommendations.push('Monitorar clientes com pagamentos atrasados');
                recommendations.push('Melhorar onboarding para novos clientes');
                recommendations.push('Coletar feedback regularmente');
            }
            else {
                recommendations.push('Manter estratégia atual de retenção');
                recommendations.push('Continuar monitorando métricas de satisfação');
            }
            console.log('📊 Predição de churn calculada', {
                riskLevel,
                predictedChurnRate,
                atRiskCount: atRiskClients.length
            });
            return {
                riskLevel,
                predictedChurnRate,
                atRiskClients: atRiskClients.slice(0, 10),
                recommendations
            };
        }
        catch (error) {
            console.error('❌ Erro ao calcular predição de churn:', error);
            return {
                riskLevel: 'low',
                predictedChurnRate: 0,
                atRiskClients: [],
                recommendations: ['Dados insuficientes para predição']
            };
        }
    }
    /**
     * Sugere estratégias de retenção baseadas em dados
     */
    async getRetentionStrategies(startDate, endDate) {
        try {
            // Analisar dados para sugerir estratégias
            const metrics = await this.getChurnMetrics(startDate, endDate);
            const churnByPlan = await this.getChurnByPlan(startDate, endDate);
            const strategies = [];
            const quickWins = [];
            // Estratégias baseadas em dados
            if (metrics.churnRate > 10) {
                strategies.push({
                    name: 'Programa de Fidelidade',
                    description: 'Implementar programa de pontos e recompensas para clientes recorrentes',
                    priority: 'high',
                    expectedImpact: 'Redução de churn em até 15%'
                });
                quickWins.push('Oferecer desconto para planos anuais');
                quickWins.push('Criar campanha de reengajamento por e-mail');
            }
            // Analisar churn por plano
            const highChurnPlan = churnByPlan.find(p => p.churnRate > 15);
            if (highChurnPlan) {
                strategies.push({
                    name: 'Revisão do Plano',
                    description: `Revisar benefícios e preço do plano ${highChurnPlan.planName} que tem alta taxa de churn (${highChurnPlan.churnRate.toFixed(1)}%)`,
                    priority: 'high',
                    expectedImpact: `Redução de churn no plano ${highChurnPlan.planName} em até 20%`
                });
            }
            // Estratégias gerais
            if (metrics.totalActive < 50) {
                strategies.push({
                    name: 'Onboarding Aprimorado',
                    description: 'Melhorar processo de onboarding para novos clientes nos primeiros 30 dias',
                    priority: 'medium',
                    expectedImpact: 'Aumento de retenção em 25%'
                });
            }
            strategies.push({
                name: 'Feedback Contínuo',
                description: 'Implementar pesquisa de NPS e coletar feedback regular dos clientes',
                priority: 'medium',
                expectedImpact: 'Identificar pontos de melhoria antes do churn'
            });
            strategies.push({
                name: 'Suporte Premium',
                description: 'Oferecer suporte dedicado para clientes com maior valor (Enterprise)',
                priority: 'medium',
                expectedImpact: 'Retenção de clientes de alto valor'
            });
            // Quick wins adicionais
            quickWins.push('Automatizar lembretes de renovação');
            quickWins.push('Criar conteúdo educativo para clientes');
            console.log('📊 Estratégias de retenção sugeridas', {
                strategiesCount: strategies.length,
                quickWinsCount: quickWins.length
            });
            return { strategies, quickWins };
        }
        catch (error) {
            console.error('❌ Erro ao sugerir estratégias de retenção:', error);
            return {
                strategies: [],
                quickWins: ['Monitorar métricas regularmente']
            };
        }
    }
    // ============================================
    // MÉTODOS PRIVADOS
    // ============================================
    /**
     * Obtém total de churns no período
     */
    async getTotalChurned(startDate, endDate) {
        return Subscription.countDocuments({
            status: 'cancelled',
            updatedAt: { $gte: startDate, $lte: endDate }
        });
    }
    /**
     * Obtém total de clientes ativos
     */
    async getTotalActive() {
        return Subscription.countDocuments({
            status: { $in: ['active', 'trialing'] }
        });
    }
    /**
     * Obtém total de clientes (histórico)
     */
    async getTotalClients() {
        return Company.countDocuments();
    }
    /**
     * Obtém tempo médio de vida em meses
     */
    async getAverageLifetimeMonths() {
        const result = await Subscription.aggregate([
            {
                $match: {
                    status: 'cancelled'
                }
            },
            {
                $project: {
                    lifetimeDays: {
                        $divide: [
                            { $subtract: ['$updatedAt', '$startDate'] },
                            1000 * 60 * 60 * 24
                        ]
                    }
                }
            },
            {
                $group: {
                    _id: null,
                    averageDays: { $avg: '$lifetimeDays' }
                }
            }
        ]);
        if (result.length === 0)
            return 6; // Fallback: 6 meses
        const avgDays = result[0].averageDays;
        const avgMonths = avgDays / 30.44; // Média de dias por mês
        return Math.max(avgMonths, 1);
    }
}
exports.ChurnAnalyticsService = ChurnAnalyticsService;
/**
 * Instância única do serviço (singleton)
 */
exports.churnAnalyticsService = new ChurnAnalyticsService();
//# sourceMappingURL=ChurnAnalyticsService.js.map