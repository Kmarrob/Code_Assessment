"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionService = void 0;
// backend/src/services/SubscriptionService.ts
const mongoose_1 = require("mongoose");
const Subscription_js_1 = require("../models/Subscription.js");
const Company_js_1 = require("../models/Company.js");
const User_js_1 = require("../models/User.js");
const PlanService_js_1 = require("./PlanService.js");
const logger_js_1 = require("../utils/logger.js");
const errorHandler_js_1 = require("../middleware/errorHandler.js");
const retry_js_1 = require("../utils/retry.js");
const circuitBreaker_js_1 = require("../utils/circuitBreaker.js");
const timeout_js_1 = require("../middleware/timeout.js");
class SubscriptionService {
    /**
     * Criar uma nova assinatura
     */
    static async createSubscription(data) {
        try {
            return await circuitBreaker_js_1.databaseCircuitBreaker.execute(async () => {
                return await (0, retry_js_1.retryDatabase)(async () => {
                    return await (0, timeout_js_1.withDbTimeout)(async () => {
                        const company = await Company_js_1.Company.findById(data.companyId);
                        if (!company) {
                            throw new errorHandler_js_1.NotFoundError('Empresa', data.companyId);
                        }
                        const plan = await PlanService_js_1.PlanService.getPlanById(data.planId);
                        if (!plan) {
                            throw new errorHandler_js_1.NotFoundError('Plano', data.planId);
                        }
                        const existingSubscription = await Subscription_js_1.Subscription.findOne({
                            companyId: data.companyId,
                            status: { $in: ['active', 'trial', 'trialing'] },
                        });
                        if (existingSubscription) {
                            throw new errorHandler_js_1.AppError('Empresa já possui uma assinatura ativa', 400);
                        }
                        const activeUsers = await User_js_1.User.countDocuments({
                            companyId: data.companyId,
                            isActive: true,
                        });
                        const startDate = new Date();
                        const trialDays = plan.trialDays || 7;
                        const trialEndDate = new Date(startDate);
                        trialEndDate.setDate(trialEndDate.getDate() + trialDays);
                        const endDate = new Date(startDate);
                        if (data.billingCycle === 'annual') {
                            endDate.setFullYear(endDate.getFullYear() + 1);
                        }
                        else {
                            endDate.setMonth(endDate.getMonth() + 1);
                        }
                        const priceCalc = await PlanService_js_1.PlanService.calculateEffectivePrice(data.planId, activeUsers, data.billingCycle === 'annual');
                        const subscription = new Subscription_js_1.Subscription({
                            companyId: new mongoose_1.Types.ObjectId(data.companyId),
                            planId: new mongoose_1.Types.ObjectId(data.planId),
                            userId: new mongoose_1.Types.ObjectId(data.userId),
                            status: 'pending',
                            startDate,
                            endDate,
                            trialStartDate: startDate,
                            trialEndDate,
                            amount: priceCalc.total,
                            currency: 'BRL',
                            billingCycle: data.billingCycle,
                            autoRenew: data.autoRenew !== undefined ? data.autoRenew : true,
                            maxUsers: plan.features.maxUsers,
                            currentUsers: activeUsers,
                            features: { ...plan.features },
                            consultingHoursTotal: plan.features.hasConsultingHours ? plan.features.consultingHours : 0,
                            consultingHoursUsed: 0,
                            consultingHoursRemaining: plan.features.hasConsultingHours ? plan.features.consultingHours : 0,
                            paymentMethod: data.paymentMethod,
                            paymentProvider: data.paymentProvider,
                            paymentId: data.paymentId,
                            subscriptionId: data.subscriptionId,
                            notes: data.notes,
                            createdBy: new mongoose_1.Types.ObjectId(data.userId),
                            updatedBy: new mongoose_1.Types.ObjectId(data.userId),
                        });
                        await subscription.save();
                        company.plan = plan.name;
                        await company.save();
                        logger_js_1.logger.info(`Assinatura criada para empresa ${company.name} - Plano ${plan.name}`);
                        return subscription;
                    }, 'SubscriptionService.createSubscription');
                }, 'SubscriptionService.createSubscription');
            });
        }
        catch (error) {
            if (error instanceof errorHandler_js_1.AppError)
                throw error;
            logger_js_1.logger.error('Erro ao criar assinatura:', error);
            throw new errorHandler_js_1.AppError('Erro ao criar assinatura. Tente novamente mais tarde.', 500);
        }
    }
    /**
     * Ativar assinatura (após pagamento confirmado)
     */
    static async activateSubscription(subscriptionId) {
        try {
            return await circuitBreaker_js_1.databaseCircuitBreaker.execute(async () => {
                return await (0, retry_js_1.retryDatabase)(async () => {
                    return await (0, timeout_js_1.withDbTimeout)(async () => {
                        const subscription = await Subscription_js_1.Subscription.findById(subscriptionId);
                        if (!subscription) {
                            throw new errorHandler_js_1.NotFoundError('Assinatura', subscriptionId);
                        }
                        subscription.status = 'active';
                        subscription.startDate = new Date();
                        const endDate = new Date(subscription.startDate);
                        if (subscription.billingCycle === 'annual') {
                            endDate.setFullYear(endDate.getFullYear() + 1);
                        }
                        else {
                            endDate.setMonth(endDate.getMonth() + 1);
                        }
                        subscription.endDate = endDate;
                        const plan = await PlanService_js_1.PlanService.getPlanById(subscription.planId.toString());
                        if (plan) {
                            const company = await Company_js_1.Company.findById(subscription.companyId);
                            if (company) {
                                company.plan = plan.name;
                                company.status = 'active';
                                await company.save();
                            }
                        }
                        await subscription.save();
                        logger_js_1.logger.info(`Assinatura ativada: ${subscriptionId}`);
                        return subscription;
                    }, 'SubscriptionService.activateSubscription');
                }, 'SubscriptionService.activateSubscription');
            });
        }
        catch (error) {
            if (error instanceof errorHandler_js_1.AppError)
                throw error;
            logger_js_1.logger.error('Erro ao ativar assinatura:', error);
            throw new errorHandler_js_1.AppError('Erro ao ativar assinatura. Tente novamente mais tarde.', 500);
        }
    }
    /**
     * Obter assinatura ativa de uma empresa
     */
    static async getActiveSubscription(companyId) {
        try {
            return await circuitBreaker_js_1.databaseCircuitBreaker.execute(async () => {
                return await (0, retry_js_1.retryDatabase)(async () => {
                    return await (0, timeout_js_1.withDbTimeout)(async () => {
                        if (!mongoose_1.Types.ObjectId.isValid(companyId)) {
                            throw new errorHandler_js_1.AppError('ID da empresa inválido', 400);
                        }
                        return Subscription_js_1.Subscription.findOne({
                            companyId: new mongoose_1.Types.ObjectId(companyId),
                            status: { $in: ['active', 'trial', 'trialing'] },
                            endDate: { $gt: new Date() },
                        }).populate('planId');
                    }, 'SubscriptionService.getActiveSubscription');
                }, 'SubscriptionService.getActiveSubscription');
            });
        }
        catch (error) {
            if (error instanceof errorHandler_js_1.AppError)
                throw error;
            logger_js_1.logger.error('Erro ao buscar assinatura ativa:', error);
            throw new errorHandler_js_1.AppError('Erro ao buscar assinatura. Tente novamente mais tarde.', 500);
        }
    }
    /**
     * Obter histórico de assinaturas de uma empresa
     */
    static async getSubscriptionHistory(companyId) {
        try {
            return await circuitBreaker_js_1.databaseCircuitBreaker.execute(async () => {
                return await (0, retry_js_1.retryDatabase)(async () => {
                    return await (0, timeout_js_1.withDbTimeout)(async () => {
                        if (!mongoose_1.Types.ObjectId.isValid(companyId)) {
                            throw new errorHandler_js_1.AppError('ID da empresa inválido', 400);
                        }
                        return Subscription_js_1.Subscription.find({
                            companyId: new mongoose_1.Types.ObjectId(companyId),
                        })
                            .sort({ createdAt: -1 })
                            .populate('planId');
                    }, 'SubscriptionService.getSubscriptionHistory');
                }, 'SubscriptionService.getSubscriptionHistory');
            });
        }
        catch (error) {
            if (error instanceof errorHandler_js_1.AppError)
                throw error;
            logger_js_1.logger.error('Erro ao buscar histórico de assinaturas:', error);
            throw new errorHandler_js_1.AppError('Erro ao buscar histórico. Tente novamente mais tarde.', 500);
        }
    }
    /**
     * Verificar status da assinatura
     */
    static async checkSubscriptionStatus(companyId) {
        try {
            const subscription = await this.getActiveSubscription(companyId);
            if (!subscription) {
                return {
                    isActive: false,
                    status: 'expired',
                    daysUntilExpiration: 0,
                    daysUntilTrialEnd: 0,
                    isOnTrial: false,
                    isExpired: true,
                    isSuspended: false,
                };
            }
            const now = new Date();
            const isActive = subscription.status === 'active' || subscription.status === 'trial' || subscription.status === 'trialing';
            const isExpired = subscription.endDate && now > subscription.endDate;
            const isOnTrial = subscription.status === 'trial' || subscription.status === 'trialing';
            const isSuspended = subscription.status === 'suspended';
            const daysUntilExpiration = subscription.endDate
                ? Math.max(0, Math.ceil((subscription.endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
                : 0;
            const daysUntilTrialEnd = subscription.trialEndDate
                ? Math.max(0, Math.ceil((subscription.trialEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
                : 0;
            return {
                isActive: isActive && !isExpired,
                status: subscription.status,
                daysUntilExpiration,
                daysUntilTrialEnd,
                isOnTrial,
                isExpired,
                isSuspended,
            };
        }
        catch (error) {
            if (error instanceof errorHandler_js_1.AppError)
                throw error;
            logger_js_1.logger.error('Erro ao verificar status da assinatura:', error);
            throw new errorHandler_js_1.AppError('Erro ao verificar status. Tente novamente mais tarde.', 500);
        }
    }
    /**
     * Atualizar assinatura
     */
    static async updateSubscription(subscriptionId, data, userId) {
        try {
            return await circuitBreaker_js_1.databaseCircuitBreaker.execute(async () => {
                return await (0, retry_js_1.retryDatabase)(async () => {
                    return await (0, timeout_js_1.withDbTimeout)(async () => {
                        if (!mongoose_1.Types.ObjectId.isValid(subscriptionId)) {
                            throw new errorHandler_js_1.AppError('ID da assinatura inválido', 400);
                        }
                        const subscription = await Subscription_js_1.Subscription.findById(subscriptionId);
                        if (!subscription) {
                            throw new errorHandler_js_1.NotFoundError('Assinatura', subscriptionId);
                        }
                        if (data.planId && data.planId !== subscription.planId.toString()) {
                            const oldPlan = await PlanService_js_1.PlanService.getPlanById(subscription.planId.toString());
                            const newPlan = await PlanService_js_1.PlanService.getPlanById(data.planId);
                            if (oldPlan && newPlan) {
                                subscription.changeHistory.push({
                                    fromPlan: oldPlan.name,
                                    toPlan: newPlan.name,
                                    changedAt: new Date(),
                                    changedBy: new mongoose_1.Types.ObjectId(userId),
                                    reason: data.notes || 'Upgrade de plano',
                                });
                            }
                        }
                        if (data.status !== undefined)
                            subscription.status = data.status;
                        if (data.planId !== undefined) {
                            subscription.planId = new mongoose_1.Types.ObjectId(data.planId);
                            const plan = await PlanService_js_1.PlanService.getPlanById(data.planId);
                            if (plan) {
                                subscription.features = { ...plan.features };
                                subscription.maxUsers = plan.features.maxUsers;
                                subscription.consultingHoursTotal = plan.features.hasConsultingHours ? plan.features.consultingHours : 0;
                                subscription.consultingHoursRemaining = plan.features.hasConsultingHours ? plan.features.consultingHours - subscription.consultingHoursUsed : 0;
                            }
                        }
                        if (data.autoRenew !== undefined)
                            subscription.autoRenew = data.autoRenew;
                        if (data.maxUsers !== undefined)
                            subscription.maxUsers = data.maxUsers;
                        if (data.currentUsers !== undefined)
                            subscription.currentUsers = data.currentUsers;
                        if (data.consultingHoursUsed !== undefined) {
                            subscription.consultingHoursUsed = data.consultingHoursUsed;
                            subscription.consultingHoursRemaining = subscription.consultingHoursTotal - data.consultingHoursUsed;
                        }
                        if (data.notes !== undefined)
                            subscription.notes = data.notes;
                        subscription.updatedBy = new mongoose_1.Types.ObjectId(userId);
                        await subscription.save();
                        logger_js_1.logger.info(`Assinatura atualizada: ${subscriptionId} por ${userId}`);
                        return subscription;
                    }, 'SubscriptionService.updateSubscription');
                }, 'SubscriptionService.updateSubscription');
            });
        }
        catch (error) {
            if (error instanceof errorHandler_js_1.AppError)
                throw error;
            logger_js_1.logger.error('Erro ao atualizar assinatura:', error);
            throw new errorHandler_js_1.AppError('Erro ao atualizar assinatura. Tente novamente mais tarde.', 500);
        }
    }
    /**
     * Cancelar assinatura
     */
    static async cancelSubscription(subscriptionId, userId, reason) {
        try {
            return await circuitBreaker_js_1.databaseCircuitBreaker.execute(async () => {
                return await (0, retry_js_1.retryDatabase)(async () => {
                    return await (0, timeout_js_1.withDbTimeout)(async () => {
                        if (!mongoose_1.Types.ObjectId.isValid(subscriptionId)) {
                            throw new errorHandler_js_1.AppError('ID da assinatura inválido', 400);
                        }
                        const subscription = await Subscription_js_1.Subscription.findById(subscriptionId);
                        if (!subscription) {
                            throw new errorHandler_js_1.NotFoundError('Assinatura', subscriptionId);
                        }
                        if (subscription.status === 'cancelled' || subscription.status === 'expired') {
                            throw new errorHandler_js_1.AppError('Assinatura já está cancelada ou expirada', 400);
                        }
                        subscription.status = 'cancelled';
                        subscription.cancelledAt = new Date();
                        subscription.autoRenew = false;
                        subscription.updatedBy = new mongoose_1.Types.ObjectId(userId);
                        subscription.notes = reason || subscription.notes || 'Cancelamento solicitado';
                        await subscription.save();
                        const company = await Company_js_1.Company.findById(subscription.companyId);
                        if (company) {
                            company.status = 'inactive';
                            await company.save();
                        }
                        logger_js_1.logger.info(`Assinatura cancelada: ${subscriptionId} por ${userId}`);
                        return subscription;
                    }, 'SubscriptionService.cancelSubscription');
                }, 'SubscriptionService.cancelSubscription');
            });
        }
        catch (error) {
            if (error instanceof errorHandler_js_1.AppError)
                throw error;
            logger_js_1.logger.error('Erro ao cancelar assinatura:', error);
            throw new errorHandler_js_1.AppError('Erro ao cancelar assinatura. Tente novamente mais tarde.', 500);
        }
    }
    /**
     * Suspender assinatura (por não pagamento)
     */
    static async suspendSubscription(subscriptionId, userId, reason = 'Pagamento não realizado') {
        try {
            return await circuitBreaker_js_1.databaseCircuitBreaker.execute(async () => {
                return await (0, retry_js_1.retryDatabase)(async () => {
                    return await (0, timeout_js_1.withDbTimeout)(async () => {
                        if (!mongoose_1.Types.ObjectId.isValid(subscriptionId)) {
                            throw new errorHandler_js_1.AppError('ID da assinatura inválido', 400);
                        }
                        const subscription = await Subscription_js_1.Subscription.findById(subscriptionId);
                        if (!subscription) {
                            throw new errorHandler_js_1.NotFoundError('Assinatura', subscriptionId);
                        }
                        if (subscription.status === 'suspended') {
                            throw new errorHandler_js_1.AppError('Assinatura já está suspensa', 400);
                        }
                        subscription.status = 'suspended';
                        subscription.suspendedAt = new Date();
                        subscription.updatedBy = new mongoose_1.Types.ObjectId(userId);
                        subscription.notes = reason;
                        await subscription.save();
                        const company = await Company_js_1.Company.findById(subscription.companyId);
                        if (company) {
                            company.status = 'suspended';
                            await company.save();
                        }
                        logger_js_1.logger.info(`Assinatura suspensa: ${subscriptionId} por ${userId} - Motivo: ${reason}`);
                        return subscription;
                    }, 'SubscriptionService.suspendSubscription');
                }, 'SubscriptionService.suspendSubscription');
            });
        }
        catch (error) {
            if (error instanceof errorHandler_js_1.AppError)
                throw error;
            logger_js_1.logger.error('Erro ao suspender assinatura:', error);
            throw new errorHandler_js_1.AppError('Erro ao suspender assinatura. Tente novamente mais tarde.', 500);
        }
    }
    /**
     * Reativar assinatura (após pagamento)
     */
    static async reactivateSubscription(subscriptionId, userId) {
        try {
            return await circuitBreaker_js_1.databaseCircuitBreaker.execute(async () => {
                return await (0, retry_js_1.retryDatabase)(async () => {
                    return await (0, timeout_js_1.withDbTimeout)(async () => {
                        if (!mongoose_1.Types.ObjectId.isValid(subscriptionId)) {
                            throw new errorHandler_js_1.AppError('ID da assinatura inválido', 400);
                        }
                        const subscription = await Subscription_js_1.Subscription.findById(subscriptionId);
                        if (!subscription) {
                            throw new errorHandler_js_1.NotFoundError('Assinatura', subscriptionId);
                        }
                        if (subscription.status !== 'suspended' && subscription.status !== 'cancelled') {
                            throw new errorHandler_js_1.AppError('Assinatura não está suspensa ou cancelada', 400);
                        }
                        subscription.status = 'active';
                        subscription.reactivatedAt = new Date();
                        subscription.updatedBy = new mongoose_1.Types.ObjectId(userId);
                        const endDate = new Date();
                        if (subscription.billingCycle === 'annual') {
                            endDate.setFullYear(endDate.getFullYear() + 1);
                        }
                        else {
                            endDate.setMonth(endDate.getMonth() + 1);
                        }
                        subscription.endDate = endDate;
                        await subscription.save();
                        const company = await Company_js_1.Company.findById(subscription.companyId);
                        if (company) {
                            company.status = 'active';
                            await company.save();
                        }
                        logger_js_1.logger.info(`Assinatura reativada: ${subscriptionId} por ${userId}`);
                        return subscription;
                    }, 'SubscriptionService.reactivateSubscription');
                }, 'SubscriptionService.reactivateSubscription');
            });
        }
        catch (error) {
            if (error instanceof errorHandler_js_1.AppError)
                throw error;
            logger_js_1.logger.error('Erro ao reativar assinatura:', error);
            throw new errorHandler_js_1.AppError('Erro ao reativar assinatura. Tente novamente mais tarde.', 500);
        }
    }
    /**
     * Processar renovações automáticas (job diário)
     */
    static async processAutoRenewals() {
        try {
            const result = { renewed: 0, suspended: 0, errors: 0 };
            const expiringSoon = await Subscription_js_1.Subscription.find({
                status: 'active',
                autoRenew: true,
                endDate: {
                    $gte: new Date(),
                    $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                },
            });
            for (const subscription of expiringSoon) {
                try {
                    const endDate = new Date(subscription.endDate);
                    if (subscription.billingCycle === 'annual') {
                        endDate.setFullYear(endDate.getFullYear() + 1);
                    }
                    else {
                        endDate.setMonth(endDate.getMonth() + 1);
                    }
                    subscription.endDate = endDate;
                    await subscription.save();
                    result.renewed++;
                    logger_js_1.logger.info(`Assinatura renovada automaticamente: ${subscription._id}`);
                }
                catch (error) {
                    logger_js_1.logger.error(`Erro ao renovar assinatura ${subscription._id}:`, error);
                    result.errors++;
                }
            }
            const expired = await Subscription_js_1.Subscription.find({
                status: 'active',
                autoRenew: false,
                endDate: { $lt: new Date() },
            });
            for (const subscription of expired) {
                try {
                    await this.suspendSubscription(subscription._id.toString(), 'system', 'Assinatura expirada sem renovação automática');
                    result.suspended++;
                }
                catch (error) {
                    logger_js_1.logger.error(`Erro ao suspender assinatura ${subscription._id}:`, error);
                    result.errors++;
                }
            }
            return result;
        }
        catch (error) {
            logger_js_1.logger.error('Erro ao processar renovações automáticas:', error);
            throw new errorHandler_js_1.AppError('Erro ao processar renovações. Tente novamente mais tarde.', 500);
        }
    }
    /**
     * Obter métricas de assinaturas (admin)
     */
    static async getSubscriptionMetrics() {
        try {
            return await circuitBreaker_js_1.databaseCircuitBreaker.execute(async () => {
                return await (0, retry_js_1.retryDatabase)(async () => {
                    return await (0, timeout_js_1.withDbTimeout)(async () => {
                        const [total, active, trial, suspended, cancelled, expired, byPlan, revenue] = await Promise.all([
                            Subscription_js_1.Subscription.countDocuments(),
                            Subscription_js_1.Subscription.countDocuments({ status: 'active' }),
                            Subscription_js_1.Subscription.countDocuments({ status: { $in: ['trial', 'trialing'] } }),
                            Subscription_js_1.Subscription.countDocuments({ status: 'suspended' }),
                            Subscription_js_1.Subscription.countDocuments({ status: 'cancelled' }),
                            Subscription_js_1.Subscription.countDocuments({ status: 'expired' }),
                            Subscription_js_1.Subscription.aggregate([
                                { $match: { status: 'active' } },
                                { $group: { _id: '$planId', count: { $sum: 1 } } },
                            ]),
                            Subscription_js_1.Subscription.aggregate([
                                { $match: { status: 'active' } },
                                { $group: {
                                        _id: '$billingCycle',
                                        total: { $sum: '$amount' },
                                    } },
                            ]),
                        ]);
                        const byPlanMap = {};
                        for (const item of byPlan) {
                            const plan = await PlanService_js_1.PlanService.getPlanById(item._id.toString());
                            if (plan) {
                                byPlanMap[plan.name] = item.count;
                            }
                        }
                        const monthlyRevenue = revenue.find(r => r._id === 'monthly')?.total || 0;
                        const annualRevenue = revenue.find(r => r._id === 'annual')?.total || 0;
                        return {
                            total,
                            active,
                            trial,
                            suspended,
                            cancelled,
                            expired,
                            byPlan: byPlanMap,
                            monthlyRevenue,
                            annualRevenue,
                        };
                    }, 'SubscriptionService.getSubscriptionMetrics');
                }, 'SubscriptionService.getSubscriptionMetrics');
            });
        }
        catch (error) {
            logger_js_1.logger.error('Erro ao obter métricas de assinaturas:', error);
            throw new errorHandler_js_1.AppError('Erro ao obter métricas. Tente novamente mais tarde.', 500);
        }
    }
    /**
     * Obter assinatura por ID
     */
    static async getSubscriptionById(subscriptionId) {
        try {
            return await circuitBreaker_js_1.databaseCircuitBreaker.execute(async () => {
                return await (0, retry_js_1.retryDatabase)(async () => {
                    return await (0, timeout_js_1.withDbTimeout)(async () => {
                        if (!mongoose_1.Types.ObjectId.isValid(subscriptionId)) {
                            throw new errorHandler_js_1.AppError('ID da assinatura inválido', 400);
                        }
                        const subscription = await Subscription_js_1.Subscription.findById(subscriptionId).populate('planId');
                        if (!subscription) {
                            throw new errorHandler_js_1.NotFoundError('Assinatura', subscriptionId);
                        }
                        return subscription;
                    }, 'SubscriptionService.getSubscriptionById');
                }, 'SubscriptionService.getSubscriptionById');
            });
        }
        catch (error) {
            if (error instanceof errorHandler_js_1.AppError)
                throw error;
            logger_js_1.logger.error('Erro ao buscar assinatura por ID:', error);
            throw new errorHandler_js_1.AppError('Erro ao buscar assinatura. Tente novamente mais tarde.', 500);
        }
    }
    /**
     * Buscar assinaturas que vão expirar em breve
     * Para jobs de renovação automática
     */
    static async getSubscriptionsExpiringSoon(days = 7) {
        try {
            return await circuitBreaker_js_1.databaseCircuitBreaker.execute(async () => {
                return await (0, retry_js_1.retryDatabase)(async () => {
                    return await (0, timeout_js_1.withDbTimeout)(async () => {
                        const now = new Date();
                        const future = new Date();
                        future.setDate(future.getDate() + days);
                        const subscriptions = await Subscription_js_1.Subscription.find({
                            status: 'active',
                            autoRenew: true,
                            endDate: {
                                $gte: now,
                                $lte: future,
                            },
                        }).populate('planId');
                        return subscriptions.map(sub => {
                            const subObj = sub.toObject();
                            const plan = sub.planId;
                            subObj.planName = plan?.displayName || 'Plano';
                            return subObj;
                        });
                    }, 'SubscriptionService.getSubscriptionsExpiringSoon');
                }, 'SubscriptionService.getSubscriptionsExpiringSoon');
            });
        }
        catch (error) {
            logger_js_1.logger.error('Erro ao buscar assinaturas prestes a expirar:', error);
            throw new errorHandler_js_1.AppError('Erro ao buscar assinaturas. Tente novamente mais tarde.', 500);
        }
    }
}
exports.SubscriptionService = SubscriptionService;
//# sourceMappingURL=SubscriptionService.js.map