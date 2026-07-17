"use strict";
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.funnelAnalyticsService = exports.FunnelAnalyticsService = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const analytics_types_1 = require("../types/analytics.types");
class FunnelAnalyticsService {
    getCompany() {
        return mongoose_1.default.model('Company');
    }
    getSubscription() {
        return mongoose_1.default.model('Subscription');
    }
    getPayment() {
        return mongoose_1.default.model('Payment');
    }
    getUser() {
        return mongoose_1.default.model('User');
    }
    getPlan() {
        return mongoose_1.default.model('Plan');
    }
    /**
     * Obtém métricas completas do funil para um período
     */
    async getFunnelMetrics(startDate, endDate) {
        try {
            console.log('📊 Calculando métricas do funil', { startDate, endDate });
            const Company = this.getCompany();
            const Subscription = this.getSubscription();
            const Payment = this.getPayment();
            // 🔴 CORRIGIDO: Contar TODAS as empresas como registros
            const totalRegistrations = await Company.countDocuments();
            // 🔴 CORRIGIDO: Contar empresas com plano ativo (independente de Subscription)
            const activeCompanies = await Company.countDocuments({
                status: 'active',
                plan: { $in: ['basic', 'pro', 'enterprise'] }
            });
            // 🔴 CORRIGIDO: Calcular conversões baseado em empresas com plano
            const convertedToPaid = await Company.countDocuments({
                plan: { $in: ['basic', 'pro', 'enterprise'] }
            });
            // 🔴 CORRIGIDO: Trials ativos (se houver Subscription)
            let activeTrials = 0;
            try {
                activeTrials = await Subscription.countDocuments({
                    status: { $in: ['trial', 'trialing'] },
                    trialEnd: { $gt: new Date() }
                });
            }
            catch (error) {
                console.warn('⚠️ Erro ao buscar trials (pode não haver coleção Subscription):', error);
                activeTrials = 0;
            }
            // 🔴 CORRIGIDO: Churns (se houver Subscription)
            let churned = 0;
            try {
                churned = await Subscription.countDocuments({
                    status: 'cancelled',
                    updatedAt: { $gte: startDate, $lte: endDate }
                });
            }
            catch (error) {
                console.warn('⚠️ Erro ao buscar churns (pode não haver coleção Subscription):', error);
                churned = 0;
            }
            // 🔴 CORRIGIDO: Trials expirados (se houver Subscription)
            let trialExpired = 0;
            try {
                trialExpired = await Subscription.countDocuments({
                    status: 'expired',
                    updatedAt: { $gte: startDate, $lte: endDate }
                });
            }
            catch (error) {
                console.warn('⚠️ Erro ao buscar trials expirados (pode não haver coleção Subscription):', error);
                trialExpired = 0;
            }
            // Calcular taxas
            const conversionRate = totalRegistrations > 0
                ? (convertedToPaid / totalRegistrations) * 100
                : 0;
            const abandonmentRate = totalRegistrations > 0
                ? (trialExpired / totalRegistrations) * 100
                : 0;
            // 🔴 CORRIGIDO: Ticket médio baseado em empresas com plano
            let averageTicket = 0;
            try {
                const paymentsResult = await Payment.aggregate([
                    { $match: { status: 'paid' } },
                    { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } }
                ]);
                if (paymentsResult.length > 0 && paymentsResult[0].count > 0) {
                    averageTicket = paymentsResult[0].total / paymentsResult[0].count;
                }
                else {
                    // 🔴 CORRIGIDO: Fallback - usar preços dos planos
                    const plans = await Company.aggregate([
                        { $match: { plan: { $in: ['basic', 'pro', 'enterprise'] } } },
                        { $group: { _id: '$plan', count: { $sum: 1 } } }
                    ]);
                    const planPrices = {
                        'basic': 1497,
                        'pro': 3297,
                        'enterprise': 5997
                    };
                    let totalValue = 0;
                    let totalCount = 0;
                    for (const plan of plans) {
                        const price = planPrices[plan._id] || 0;
                        totalValue += price * plan.count;
                        totalCount += plan.count;
                    }
                    averageTicket = totalCount > 0 ? totalValue / totalCount : 0;
                }
            }
            catch (error) {
                console.warn('⚠️ Erro ao calcular ticket médio:', error);
                averageTicket = 0;
            }
            const metrics = {
                totalRegistrations,
                activeTrials,
                convertedToPaid,
                activeSubscriptions: activeCompanies,
                churned,
                conversionRate,
                abandonmentRate,
                trialExpired,
                averageTicket
            };
            console.log('✅ Métricas do funil calculadas', metrics);
            return metrics;
        }
        catch (error) {
            console.error('❌ Erro ao calcular métricas do funil:', error);
            throw error;
        }
    }
    /**
     * Obtém detalhamento completo do funil com etapas
     */
    async getFunnelDetails(startDate, endDate) {
        try {
            const metrics = await this.getFunnelMetrics(startDate, endDate);
            const steps = [
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
            // 🔴 CORRIGIDO: Verifica se step e prevStep existem antes de acessar
            for (let i = 1; i < steps.length; i++) {
                const step = steps[i];
                const prevStep = steps[i - 1];
                if (step && prevStep && prevStep.count > 0) {
                    step.percentage = (step.count / prevStep.count) * 100;
                }
            }
            console.log('📊 Detalhes do funil calculados', { steps });
            return { steps, metrics };
        }
        catch (error) {
            console.error('❌ Erro ao calcular detalhes do funil:', error);
            throw error;
        }
    }
    /**
     * Obtém lista de clientes com status no funil
     */
    async getClientList(startDate, endDate, filters) {
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
            const clients = [];
            // 🔴 CORRIGIDO: Mapeamento de preços por plano
            const planPrices = {
                'basic': 1497,
                'pro': 3297,
                'enterprise': 5997
            };
            // 🔴 CORRIGIDO: Mapeamento de nomes de planos
            const planNames = {
                'basic': 'Básico',
                'pro': 'Profissional',
                'enterprise': 'Enterprise'
            };
            for (const company of companies) {
                // 🔴 CORRIGIDO: Buscar subscription (pode não existir)
                let subscription = null;
                try {
                    subscription = await Subscription.findOne({
                        companyId: company._id,
                        status: { $in: ['trial', 'active', 'trialing', 'past_due', 'cancelled'] }
                    });
                }
                catch (error) {
                    console.warn(`⚠️ Erro ao buscar subscription para ${company.name}:`, error);
                }
                // 🔴 CORRIGIDO: Buscar payments (pode não existir)
                let payments = [];
                try {
                    payments = await Payment.find({
                        companyId: company._id,
                        status: 'paid'
                    });
                }
                catch (error) {
                    console.warn(`⚠️ Erro ao buscar payments para ${company.name}:`, error);
                }
                const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
                const users = await User.find({ companyId: company._id });
                const userCount = users.length;
                const funnelStatus = await this.determineFunnelStatus(company, subscription, payments);
                if (filters?.status && filters.status !== funnelStatus)
                    continue;
                if (filters?.plan && subscription?.planId?.name !== filters.plan)
                    continue;
                const lastLogin = users.length > 0
                    ? users.reduce((latest, u) => {
                        if (!latest)
                            return u.lastLogin;
                        return u.lastLogin && u.lastLogin > latest ? u.lastLogin : latest;
                    }, null)
                    : undefined;
                let nextBilling;
                if (subscription && subscription.status === 'active') {
                    const nextMonth = new Date();
                    nextMonth.setMonth(nextMonth.getMonth() + 1);
                    nextBilling = nextMonth;
                }
                // 🔴 CORRIGIDO: Usar o campo 'plan' da Company como fonte primária
                let planName = company.plan || 'Nenhum';
                let monthlyValue = 0;
                // Se não tiver plano na Company, tentar da Subscription
                if (planName === 'Nenhum' && subscription && subscription.planId) {
                    try {
                        const plan = await Plan.findById(subscription.planId);
                        if (plan) {
                            planName = plan.name;
                            monthlyValue = plan.price || 0;
                        }
                    }
                    catch (error) {
                        console.warn(`⚠️ Erro ao buscar plan para ${company.name}:`, error);
                    }
                }
                else if (planName !== 'Nenhum') {
                    // Buscar o valor do plano pelo nome
                    monthlyValue = planPrices[planName.toLowerCase()] || 0;
                    // Usar o nome amigável
                    planName = planNames[planName.toLowerCase()] || planName;
                }
                // 🔴 CORRIGIDO: Calcular tempo de assinatura
                let subscriptionDays = 0;
                let subscriptionMonths = 0;
                if (subscription && subscription.startDate) {
                    const now = new Date();
                    const diffTime = now.getTime() - new Date(subscription.startDate).getTime();
                    subscriptionDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
                    subscriptionMonths = Math.floor(subscriptionDays / 30.44);
                }
                else if (company.createdAt) {
                    // Fallback: usar data de criação da empresa
                    const now = new Date();
                    const diffTime = now.getTime() - new Date(company.createdAt).getTime();
                    subscriptionDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
                    subscriptionMonths = Math.floor(subscriptionDays / 30.44);
                }
                clients.push({
                    id: company._id.toString(),
                    name: company.name,
                    document: company.cnpj || undefined,
                    planName,
                    funnelStatus,
                    subscriptionStatus: subscription?.status || (company.plan ? 'active' : 'none'),
                    joinedAt: company.createdAt,
                    lastLogin: lastLogin || undefined,
                    monthlyValue,
                    totalPaid,
                    nextBilling,
                    userCount,
                    // 🔴 NOVO: Campos adicionais para exibição
                    subscriptionDays,
                    subscriptionMonths
                });
            }
            let filteredClients = clients;
            if (filters?.search) {
                const search = filters.search.toLowerCase();
                filteredClients = clients.filter(c => c.name.toLowerCase().includes(search) ||
                    c.id.includes(search));
            }
            console.log('📊 Lista de clientes gerada', { total: filteredClients.length });
            return {
                clients: filteredClients,
                total,
                page: Math.floor(offset / limit) + 1,
                limit
            };
        }
        catch (error) {
            console.error('❌ Erro ao obter lista de clientes:', error);
            throw error;
        }
    }
    /**
     * Obtém distribuição de status dos clientes
     */
    async getStatusDistribution(startDate, endDate) {
        try {
            const distribution = [];
            const statuses = [
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
            const statusCounts = {};
            for (const company of companies) {
                let subscription = null;
                try {
                    subscription = await Subscription.findOne({
                        companyId: company._id
                    });
                }
                catch (error) {
                    // Ignorar erro - subscription pode não existir
                }
                let payments = [];
                try {
                    payments = await Payment.find({
                        companyId: company._id,
                        status: 'paid'
                    });
                }
                catch (error) {
                    // Ignorar erro - payments pode não existir
                }
                const status = await this.determineFunnelStatus(company, subscription, payments);
                statusCounts[status] = (statusCounts[status] || 0) + 1;
            }
            for (const status of statuses) {
                const count = statusCounts[status] || 0;
                distribution.push({
                    status,
                    label: analytics_types_1.FunnelStatusLabels[status],
                    count,
                    percentage: total > 0 ? (count / total) * 100 : 0,
                    color: analytics_types_1.FunnelStatusColors[status]
                });
            }
            distribution.sort((a, b) => b.count - a.count);
            console.log('📊 Distribuição de status calculada', { distribution });
            return distribution;
        }
        catch (error) {
            console.error('❌ Erro ao calcular distribuição de status:', error);
            throw error;
        }
    }
    /**
     * Obtém trials abandonados (não converteram após 7 dias)
     */
    async getAbandonedTrials(startDate, endDate) {
        try {
            const Subscription = this.getSubscription();
            const Payment = this.getPayment();
            const Company = this.getCompany();
            let expiredTrials = [];
            try {
                expiredTrials = await Subscription.find({
                    status: 'cancelled',
                    trialEnd: { $gte: startDate, $lte: endDate }
                });
            }
            catch (error) {
                console.warn('⚠️ Erro ao buscar trials abandonados (coleção Subscription pode não existir):', error);
                return { total: 0, clients: [] };
            }
            const abandoned = [];
            for (const sub of expiredTrials) {
                const payment = await Payment.findOne({
                    subscriptionId: sub._id,
                    status: 'paid'
                });
                if (!payment) {
                    const company = await Company.findById(sub.companyId);
                    if (company) {
                        const daysActive = Math.floor((new Date().getTime() - sub.startDate.getTime()) / (1000 * 60 * 60 * 24));
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
        }
        catch (error) {
            console.error('❌ Erro ao buscar trials abandonados:', error);
            throw error;
        }
    }
    /**
     * Obtém tendência de conversão ao longo do tempo
     */
    async getConversionTrend(startDate, endDate, interval = 'weekly') {
        try {
            const periods = [];
            const registrations = [];
            const conversions = [];
            const conversionRates = [];
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
                // 🔴 CORRIGIDO: Contar empresas com plano como conversões
                let convCount = 0;
                try {
                    convCount = await Payment.countDocuments({
                        status: 'paid',
                        createdAt: { $gte: periodStart, $lte: periodEnd }
                    });
                }
                catch (error) {
                    console.warn('⚠️ Erro ao buscar payments:', error);
                    // Fallback: contar empresas criadas no período com plano
                    convCount = await Company.countDocuments({
                        createdAt: { $gte: periodStart, $lte: periodEnd },
                        plan: { $in: ['basic', 'pro', 'enterprise'] }
                    });
                }
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
        }
        catch (error) {
            console.error('❌ Erro ao calcular tendência de conversão:', error);
            throw error;
        }
    }
    // ============================================
    // MÉTODOS PRIVADOS
    // ============================================
    /**
     * Determina o status de uma empresa no funil
     * 🔴 CORRIGIDO: Considera o campo 'plan' da Company
     */
    async determineFunnelStatus(company, subscription, payments) {
        const Payment = this.getPayment();
        // 🔴 CORRIGIDO: Se não tem subscription, verificar o campo 'plan' da Company
        if (!subscription) {
            // Se a empresa tem plano definido e está ativa, considerar como 'active'
            if (company.plan && company.status === 'active') {
                return 'active';
            }
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
                // 🔴 CORRIGIDO: Payment.exists retorna objeto ou null, não boolean
                let hasPayment = false;
                try {
                    const paymentExists = await Payment.exists({
                        companyId: company._id,
                        status: 'paid'
                    });
                    hasPayment = !!paymentExists; // Converte para boolean
                }
                catch (error) {
                    console.warn('⚠️ Erro ao verificar payment:', error);
                }
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
    async getTotalRegistrations() {
        const Company = this.getCompany();
        return Company.countDocuments();
    }
    /**
     * Obtém trials ativos
     */
    async getActiveTrials() {
        const Subscription = this.getSubscription();
        return Subscription.countDocuments({
            status: { $in: ['trial', 'trialing'] },
            trialEnd: { $gt: new Date() }
        });
    }
    /**
     * Obtém empresas que converteram para pago
     */
    async getConvertedToPaid(startDate, endDate) {
        const Payment = this.getPayment();
        try {
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
        catch (error) {
            console.warn('⚠️ Erro ao buscar convertedToPaid:', error);
            // Fallback: contar empresas com plano
            const Company = this.getCompany();
            return Company.countDocuments({
                plan: { $in: ['basic', 'pro', 'enterprise'] }
            });
        }
    }
    /**
     * Obtém assinaturas ativas
     * 🔴 CORRIGIDO: Conta empresas com plano ativo
     */
    async getActiveSubscriptions() {
        const Company = this.getCompany();
        return Company.countDocuments({
            status: 'active',
            plan: { $in: ['basic', 'pro', 'enterprise'] }
        });
    }
    /**
     * Obtém churns no período
     */
    async getChurned(startDate, endDate) {
        const Subscription = this.getSubscription();
        try {
            return Subscription.countDocuments({
                status: 'cancelled',
                updatedAt: { $gte: startDate, $lte: endDate }
            });
        }
        catch (error) {
            console.warn('⚠️ Erro ao buscar churns:', error);
            return 0;
        }
    }
    /**
     * Obtém trials expirados
     */
    async getTrialExpired(startDate, endDate) {
        const Subscription = this.getSubscription();
        try {
            return Subscription.countDocuments({
                status: 'expired',
                updatedAt: { $gte: startDate, $lte: endDate }
            });
        }
        catch (error) {
            console.warn('⚠️ Erro ao buscar trials expirados:', error);
            return 0;
        }
    }
    /**
     * Obtém ticket médio
     */
    async getAverageTicket(convertedToPaid) {
        if (convertedToPaid === 0)
            return 0;
        const Payment = this.getPayment();
        try {
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
            if (result.length === 0)
                return 0;
            return result[0].total / result[0].count;
        }
        catch (error) {
            console.warn('⚠️ Erro ao calcular ticket médio:', error);
            // Fallback: usar preços dos planos
            const Company = this.getCompany();
            const plans = await Company.aggregate([
                { $match: { plan: { $in: ['basic', 'pro', 'enterprise'] } } },
                { $group: { _id: '$plan', count: { $sum: 1 } } }
            ]);
            const planPrices = {
                'basic': 1497,
                'pro': 3297,
                'enterprise': 5997
            };
            let totalValue = 0;
            let totalCount = 0;
            for (const plan of plans) {
                const price = planPrices[plan._id] || 0;
                totalValue += price * plan.count;
                totalCount += plan.count;
            }
            return totalCount > 0 ? totalValue / totalCount : 0;
        }
    }
}
exports.FunnelAnalyticsService = FunnelAnalyticsService;
/**
 * Instância única do serviço (singleton)
 */
exports.funnelAnalyticsService = new FunnelAnalyticsService();
exports.default = exports.funnelAnalyticsService;
//# sourceMappingURL=FunnelAnalyticsService.js.map