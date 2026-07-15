"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentService = void 0;
// backend/src/services/PaymentService.ts
const mongoose_1 = require("mongoose");
const Payment_js_1 = require("../models/Payment.js");
const Company_js_1 = require("../models/Company.js");
const User_js_1 = require("../models/User.js");
const PlanService_js_1 = require("./PlanService.js");
const SubscriptionService_js_1 = require("./SubscriptionService.js");
const logger_js_1 = require("../utils/logger.js");
const errorHandler_js_1 = require("../middleware/errorHandler.js");
const retry_js_1 = require("../utils/retry.js");
const circuitBreaker_js_1 = require("../utils/circuitBreaker.js");
const timeout_js_1 = require("../middleware/timeout.js");
class PaymentService {
    /**
     * Criar um novo registro de pagamento
     */
    static async createPayment(data) {
        try {
            return await circuitBreaker_js_1.databaseCircuitBreaker.execute(async () => {
                return await (0, retry_js_1.retryDatabase)(async () => {
                    return await (0, timeout_js_1.withDbTimeout)(async () => {
                        const company = await Company_js_1.Company.findById(data.companyId);
                        if (!company) {
                            throw new errorHandler_js_1.NotFoundError('Empresa', data.companyId);
                        }
                        const user = await User_js_1.User.findById(data.userId);
                        if (!user) {
                            throw new errorHandler_js_1.NotFoundError('Usuário', data.userId);
                        }
                        const totalItems = data.items.reduce((sum, item) => sum + item.totalPrice, 0);
                        const totalDiscounts = (data.discounts || []).reduce((sum, d) => sum + d.amount, 0);
                        const totalFees = (data.fees || []).reduce((sum, f) => sum + f.amount, 0);
                        const calculatedTotal = totalItems - totalDiscounts + totalFees;
                        if (Math.abs(calculatedTotal - data.amount) > 1) {
                            logger_js_1.logger.warn(`Discrepância no valor do pagamento: calculado ${calculatedTotal}, informado ${data.amount}`);
                        }
                        const payment = new Payment_js_1.Payment({
                            companyId: new mongoose_1.Types.ObjectId(data.companyId),
                            subscriptionId: data.subscriptionId ? new mongoose_1.Types.ObjectId(data.subscriptionId) : undefined,
                            userId: new mongoose_1.Types.ObjectId(data.userId),
                            amount: data.amount,
                            amountPaid: 0,
                            amountRefunded: 0,
                            currency: data.currency || 'BRL',
                            transactionType: data.transactionType,
                            paymentMethod: data.paymentMethod,
                            paymentProvider: data.paymentProvider,
                            providerPaymentId: data.providerPaymentId,
                            providerSubscriptionId: data.providerSubscriptionId,
                            status: 'pending',
                            statusHistory: [{ status: 'pending', changedAt: new Date() }],
                            dueDate: data.dueDate,
                            billingPeriod: data.billingPeriod,
                            items: data.items,
                            discounts: data.discounts || [],
                            fees: data.fees || [],
                            boletoUrl: data.boletoUrl,
                            boletoBarcode: data.boletoBarcode,
                            pixQrCode: data.pixQrCode,
                            pixCopiaCola: data.pixCopiaCola,
                            cardLastDigits: data.cardLastDigits,
                            cardBrand: data.cardBrand,
                            notes: data.notes,
                            metadata: data.metadata,
                            companyName: company.name,
                            companyCnpj: company.cnpj,
                            userEmail: user.email,
                            userName: user.name,
                            createdBy: new mongoose_1.Types.ObjectId(data.userId),
                            updatedBy: new mongoose_1.Types.ObjectId(data.userId),
                        });
                        await payment.save();
                        logger_js_1.logger.info(`Pagamento criado: ${payment._id} - ${payment.amount} ${payment.currency}`);
                        return payment;
                    }, 'PaymentService.createPayment');
                }, 'PaymentService.createPayment');
            });
        }
        catch (error) {
            if (error instanceof errorHandler_js_1.AppError)
                throw error;
            logger_js_1.logger.error('Erro ao criar pagamento:', error);
            throw new errorHandler_js_1.AppError('Erro ao criar pagamento. Tente novamente mais tarde.', 500);
        }
    }
    /**
     * Confirmar pagamento (webhook)
     */
    static async confirmPayment(providerPaymentId, provider, amountPaid, paidAt, metadata) {
        try {
            return await circuitBreaker_js_1.databaseCircuitBreaker.execute(async () => {
                return await (0, retry_js_1.retryDatabase)(async () => {
                    return await (0, timeout_js_1.withDbTimeout)(async () => {
                        let payment = await Payment_js_1.Payment.findOne({ providerPaymentId });
                        if (!payment && metadata?.subscriptionId) {
                            payment = await Payment_js_1.Payment.findOne({ subscriptionId: metadata.subscriptionId });
                        }
                        if (!payment) {
                            throw new errorHandler_js_1.NotFoundError('Pagamento', providerPaymentId);
                        }
                        if (payment.status === 'paid') {
                            logger_js_1.logger.warn(`Pagamento ${payment._id} já está confirmado`);
                            return payment;
                        }
                        payment.status = 'paid';
                        payment.amountPaid = amountPaid;
                        payment.paidAt = paidAt;
                        payment.processedAt = new Date();
                        payment.webhookReceived = true;
                        payment.webhookProcessedAt = new Date();
                        payment.webhookPayload = metadata;
                        payment.statusHistory.push({
                            status: 'paid',
                            changedAt: new Date(),
                        });
                        await payment.save();
                        logger_js_1.logger.info(`Pagamento confirmado: ${payment._id} - ${amountPaid} ${payment.currency}`);
                        if (payment.subscriptionId) {
                            try {
                                const subscriptionIdStr = String(payment.subscriptionId);
                                await SubscriptionService_js_1.SubscriptionService.activateSubscription(subscriptionIdStr);
                                logger_js_1.logger.info(`Assinatura ativada após pagamento: ${subscriptionIdStr}`);
                            }
                            catch (subError) {
                                logger_js_1.logger.error(`Erro ao ativar assinatura ${payment.subscriptionId}:`, subError);
                            }
                        }
                        return payment;
                    }, 'PaymentService.confirmPayment');
                }, 'PaymentService.confirmPayment');
            });
        }
        catch (error) {
            if (error instanceof errorHandler_js_1.AppError)
                throw error;
            logger_js_1.logger.error('Erro ao confirmar pagamento:', error);
            throw new errorHandler_js_1.AppError('Erro ao confirmar pagamento. Tente novamente mais tarde.', 500);
        }
    }
    /**
     * Marcar pagamento como falho
     */
    static async failPayment(providerPaymentId, reason) {
        try {
            return await circuitBreaker_js_1.databaseCircuitBreaker.execute(async () => {
                return await (0, retry_js_1.retryDatabase)(async () => {
                    return await (0, timeout_js_1.withDbTimeout)(async () => {
                        const payment = await Payment_js_1.Payment.findOne({ providerPaymentId });
                        if (!payment) {
                            throw new errorHandler_js_1.NotFoundError('Pagamento', providerPaymentId);
                        }
                        if (payment.status === 'paid') {
                            throw new errorHandler_js_1.AppError('Pagamento já foi confirmado', 400);
                        }
                        payment.status = 'failed';
                        payment.statusHistory.push({
                            status: 'failed',
                            changedAt: new Date(),
                            reason,
                        });
                        payment.notes = payment.notes ? `${payment.notes} | Falha: ${reason}` : `Falha: ${reason}`;
                        await payment.save();
                        logger_js_1.logger.warn(`Pagamento falhou: ${payment._id} - ${reason}`);
                        return payment;
                    }, 'PaymentService.failPayment');
                }, 'PaymentService.failPayment');
            });
        }
        catch (error) {
            if (error instanceof errorHandler_js_1.AppError)
                throw error;
            logger_js_1.logger.error('Erro ao marcar pagamento como falho:', error);
            throw new errorHandler_js_1.AppError('Erro ao processar falha de pagamento. Tente novamente mais tarde.', 500);
        }
    }
    /**
     * Estornar pagamento
     */
    static async refundPayment(paymentId, userId, reason) {
        try {
            return await circuitBreaker_js_1.databaseCircuitBreaker.execute(async () => {
                return await (0, retry_js_1.retryDatabase)(async () => {
                    return await (0, timeout_js_1.withDbTimeout)(async () => {
                        if (!mongoose_1.Types.ObjectId.isValid(paymentId)) {
                            throw new errorHandler_js_1.AppError('ID do pagamento inválido', 400);
                        }
                        const payment = await Payment_js_1.Payment.findById(paymentId);
                        if (!payment) {
                            throw new errorHandler_js_1.NotFoundError('Pagamento', paymentId);
                        }
                        if (payment.status !== 'paid') {
                            throw new errorHandler_js_1.AppError('Apenas pagamentos confirmados podem ser estornados', 400);
                        }
                        payment.status = 'refunded';
                        payment.amountRefunded = payment.amountPaid;
                        payment.refundedAt = new Date();
                        payment.statusHistory.push({
                            status: 'refunded',
                            changedAt: new Date(),
                            reason,
                        });
                        payment.updatedBy = new mongoose_1.Types.ObjectId(userId);
                        payment.notes = payment.notes ? `${payment.notes} | Estornado: ${reason || 'Solicitado'}` : `Estornado: ${reason || 'Solicitado'}`;
                        await payment.save();
                        logger_js_1.logger.info(`Pagamento estornado: ${payment._id} por ${userId}`);
                        return payment;
                    }, 'PaymentService.refundPayment');
                }, 'PaymentService.refundPayment');
            });
        }
        catch (error) {
            if (error instanceof errorHandler_js_1.AppError)
                throw error;
            logger_js_1.logger.error('Erro ao estornar pagamento:', error);
            throw new errorHandler_js_1.AppError('Erro ao estornar pagamento. Tente novamente mais tarde.', 500);
        }
    }
    /**
     * Obter pagamento por ID
     */
    static async getPaymentById(paymentId) {
        try {
            return await circuitBreaker_js_1.databaseCircuitBreaker.execute(async () => {
                return await (0, retry_js_1.retryDatabase)(async () => {
                    return await (0, timeout_js_1.withDbTimeout)(async () => {
                        if (!mongoose_1.Types.ObjectId.isValid(paymentId)) {
                            throw new errorHandler_js_1.AppError('ID do pagamento inválido', 400);
                        }
                        const payment = await Payment_js_1.Payment.findById(paymentId);
                        if (!payment) {
                            throw new errorHandler_js_1.NotFoundError('Pagamento', paymentId);
                        }
                        return payment;
                    }, 'PaymentService.getPaymentById');
                }, 'PaymentService.getPaymentById');
            });
        }
        catch (error) {
            if (error instanceof errorHandler_js_1.AppError)
                throw error;
            logger_js_1.logger.error('Erro ao buscar pagamento:', error);
            throw new errorHandler_js_1.AppError('Erro ao buscar pagamento. Tente novamente mais tarde.', 500);
        }
    }
    /**
     * Obter pagamentos por empresa
     */
    static async getPaymentsByCompany(companyId, pagination = {}) {
        try {
            return await circuitBreaker_js_1.databaseCircuitBreaker.execute(async () => {
                return await (0, retry_js_1.retryDatabase)(async () => {
                    return await (0, timeout_js_1.withDbTimeout)(async () => {
                        if (!mongoose_1.Types.ObjectId.isValid(companyId)) {
                            throw new errorHandler_js_1.AppError('ID da empresa inválido', 400);
                        }
                        const { page = 1, limit = 20 } = pagination;
                        const skip = (page - 1) * limit;
                        const [payments, total] = await Promise.all([
                            Payment_js_1.Payment.find({ companyId: new mongoose_1.Types.ObjectId(companyId) })
                                .sort({ createdAt: -1 })
                                .skip(skip)
                                .limit(limit)
                                .lean(),
                            Payment_js_1.Payment.countDocuments({ companyId: new mongoose_1.Types.ObjectId(companyId) }),
                        ]);
                        const totalPages = Math.ceil(total / limit);
                        return {
                            payments: payments,
                            total,
                            totalPages,
                        };
                    }, 'PaymentService.getPaymentsByCompany');
                }, 'PaymentService.getPaymentsByCompany');
            });
        }
        catch (error) {
            if (error instanceof errorHandler_js_1.AppError)
                throw error;
            logger_js_1.logger.error('Erro ao buscar pagamentos da empresa:', error);
            throw new errorHandler_js_1.AppError('Erro ao buscar pagamentos. Tente novamente mais tarde.', 500);
        }
    }
    /**
     * Obter todos os pagamentos (admin)
     */
    static async getAllPayments(filters = {}, pagination = {}) {
        try {
            return await circuitBreaker_js_1.databaseCircuitBreaker.execute(async () => {
                return await (0, retry_js_1.retryDatabase)(async () => {
                    return await (0, timeout_js_1.withDbTimeout)(async () => {
                        const { page = 1, limit = 20 } = pagination;
                        const { status, companyId, startDate, endDate } = filters;
                        const match = {};
                        if (status)
                            match.status = status;
                        if (companyId)
                            match.companyId = new mongoose_1.Types.ObjectId(companyId);
                        if (startDate || endDate) {
                            match.createdAt = {};
                            if (startDate)
                                match.createdAt.$gte = startDate;
                            if (endDate)
                                match.createdAt.$lte = endDate;
                        }
                        const skip = (page - 1) * limit;
                        const [payments, total] = await Promise.all([
                            Payment_js_1.Payment.find(match)
                                .sort({ createdAt: -1 })
                                .skip(skip)
                                .limit(limit)
                                .populate('companyId', 'name cnpj')
                                .populate('userId', 'name email')
                                .lean(),
                            Payment_js_1.Payment.countDocuments(match),
                        ]);
                        const totalPages = Math.ceil(total / limit);
                        return {
                            payments: payments,
                            total,
                            totalPages,
                        };
                    }, 'PaymentService.getAllPayments');
                }, 'PaymentService.getAllPayments');
            });
        }
        catch (error) {
            if (error instanceof errorHandler_js_1.AppError)
                throw error;
            logger_js_1.logger.error('Erro ao listar pagamentos:', error);
            throw new errorHandler_js_1.AppError('Erro ao listar pagamentos. Tente novamente mais tarde.', 500);
        }
    }
    /**
     * Obter métricas de pagamento (admin)
     */
    static async getPaymentMetrics() {
        try {
            return await circuitBreaker_js_1.databaseCircuitBreaker.execute(async () => {
                return await (0, retry_js_1.retryDatabase)(async () => {
                    return await (0, timeout_js_1.withDbTimeout)(async () => {
                        const now = new Date();
                        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
                        const [totalRevenue, monthlyRevenue, pendingPayments, failedPayments, refundedPayments, byMethod, byStatus, recentPayments,] = await Promise.all([
                            Payment_js_1.Payment.aggregate([
                                { $match: { status: 'paid' } },
                                { $group: { _id: null, total: { $sum: '$amountPaid' } } },
                            ]),
                            Payment_js_1.Payment.aggregate([
                                { $match: { status: 'paid', paidAt: { $gte: startOfMonth } } },
                                { $group: { _id: null, total: { $sum: '$amountPaid' } } },
                            ]),
                            Payment_js_1.Payment.countDocuments({ status: 'pending' }),
                            Payment_js_1.Payment.countDocuments({ status: 'failed' }),
                            Payment_js_1.Payment.countDocuments({ status: 'refunded' }),
                            Payment_js_1.Payment.aggregate([
                                { $group: { _id: '$paymentMethod', count: { $sum: 1 } } },
                            ]),
                            Payment_js_1.Payment.aggregate([
                                { $group: { _id: '$status', count: { $sum: 1 } } },
                            ]),
                            Payment_js_1.Payment.find()
                                .sort({ createdAt: -1 })
                                .limit(10)
                                .populate('companyId', 'name')
                                .lean(),
                        ]);
                        const byMethodMap = {};
                        for (const item of byMethod) {
                            byMethodMap[item._id] = item.count;
                        }
                        const byStatusMap = {};
                        for (const item of byStatus) {
                            byStatusMap[item._id] = item.count;
                        }
                        return {
                            totalRevenue: totalRevenue[0]?.total || 0,
                            monthlyRevenue: monthlyRevenue[0]?.total || 0,
                            pendingPayments,
                            failedPayments,
                            refundedPayments,
                            byMethod: byMethodMap,
                            byStatus: byStatusMap,
                            recentPayments: recentPayments,
                        };
                    }, 'PaymentService.getPaymentMetrics');
                }, 'PaymentService.getPaymentMetrics');
            });
        }
        catch (error) {
            logger_js_1.logger.error('Erro ao obter métricas de pagamento:', error);
            throw new errorHandler_js_1.AppError('Erro ao obter métricas. Tente novamente mais tarde.', 500);
        }
    }
    /**
     * Verificar pagamentos pendentes (job diário)
     */
    static async checkPendingPayments() {
        try {
            const result = { expired: 0, overdue: 0 };
            const expiredPayments = await Payment_js_1.Payment.find({
                status: 'pending',
                expiresAt: { $lt: new Date() },
            });
            for (const payment of expiredPayments) {
                payment.status = 'expired';
                payment.statusHistory.push({
                    status: 'expired',
                    changedAt: new Date(),
                    reason: 'Boleto expirado',
                });
                await payment.save();
                result.expired++;
            }
            const overduePayments = await Payment_js_1.Payment.find({
                status: 'pending',
                dueDate: { $lt: new Date() },
                expiresAt: { $exists: false },
            });
            for (const payment of overduePayments) {
                payment.notes = payment.notes
                    ? `${payment.notes} | Vencido desde ${payment.dueDate.toISOString()}`
                    : `Vencido desde ${payment.dueDate.toISOString()}`;
                await payment.save();
                result.overdue++;
            }
            return result;
        }
        catch (error) {
            logger_js_1.logger.error('Erro ao verificar pagamentos pendentes:', error);
            throw new errorHandler_js_1.AppError('Erro ao verificar pagamentos. Tente novamente mais tarde.', 500);
        }
    }
    /**
     * Gerar fatura para assinatura
     */
    static async generateInvoice(subscriptionId, userId) {
        try {
            return await circuitBreaker_js_1.databaseCircuitBreaker.execute(async () => {
                return await (0, retry_js_1.retryDatabase)(async () => {
                    return await (0, timeout_js_1.withDbTimeout)(async () => {
                        const subscription = await SubscriptionService_js_1.SubscriptionService.getSubscriptionById(subscriptionId);
                        if (!subscription) {
                            throw new errorHandler_js_1.NotFoundError('Assinatura', subscriptionId);
                        }
                        const company = await Company_js_1.Company.findById(subscription.companyId);
                        if (!company) {
                            throw new errorHandler_js_1.NotFoundError('Empresa', String(subscription.companyId));
                        }
                        const planIdStr = String(subscription.planId);
                        const plan = await PlanService_js_1.PlanService.getPlanById(planIdStr);
                        const startDate = new Date();
                        const endDate = new Date();
                        if (subscription.billingCycle === 'annual') {
                            endDate.setFullYear(endDate.getFullYear() + 1);
                        }
                        else {
                            endDate.setMonth(endDate.getMonth() + 1);
                        }
                        const items = [
                            {
                                description: `Plano ${plan.displayName} - ${subscription.billingCycle === 'annual' ? 'Anual' : 'Mensal'}`,
                                quantity: 1,
                                unitPrice: subscription.amount,
                                totalPrice: subscription.amount,
                                type: 'plan',
                            },
                        ];
                        const extraUsers = Math.max(0, subscription.currentUsers - subscription.maxUsers);
                        if (extraUsers > 0) {
                            const extraPrice = extraUsers * plan.pricePerUser;
                            items.push({
                                description: `${extraUsers} usuário(s) adicional(is)`,
                                quantity: extraUsers,
                                unitPrice: plan.pricePerUser,
                                totalPrice: extraPrice,
                                type: 'user',
                            });
                        }
                        const totalAmount = items.reduce((sum, item) => sum + item.totalPrice, 0);
                        const subscriptionIdStr = String(subscription._id);
                        const companyIdStr = String(subscription.companyId);
                        const payment = await PaymentService.createPayment({
                            companyId: companyIdStr,
                            subscriptionId: subscriptionIdStr,
                            userId,
                            amount: totalAmount,
                            transactionType: 'subscription',
                            paymentMethod: 'credit_card',
                            paymentProvider: 'manual',
                            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                            billingPeriod: { start: startDate, end: endDate },
                            items,
                            notes: `Fatura gerada automaticamente para assinatura ${subscription._id}`,
                        });
                        logger_js_1.logger.info(`Fatura gerada para assinatura ${subscriptionId}: ${payment._id}`);
                        return payment;
                    }, 'PaymentService.generateInvoice');
                }, 'PaymentService.generateInvoice');
            });
        }
        catch (error) {
            if (error instanceof errorHandler_js_1.AppError)
                throw error;
            logger_js_1.logger.error('Erro ao gerar fatura:', error);
            throw new errorHandler_js_1.AppError('Erro ao gerar fatura. Tente novamente mais tarde.', 500);
        }
    }
    // ============================================
    // 🔴 NOVOS MÉTODOS PARA FASE 5 - GATEWAY DE PAGAMENTO
    // ============================================
    /**
     * Obter pagamento por ID do provedor
     */
    static async getPaymentByProviderId(providerPaymentId) {
        try {
            return await circuitBreaker_js_1.databaseCircuitBreaker.execute(async () => {
                return await (0, retry_js_1.retryDatabase)(async () => {
                    return await (0, timeout_js_1.withDbTimeout)(async () => {
                        return Payment_js_1.Payment.findOne({ providerPaymentId });
                    }, 'PaymentService.getPaymentByProviderId');
                }, 'PaymentService.getPaymentByProviderId');
            });
        }
        catch (error) {
            logger_js_1.logger.error('Erro ao buscar pagamento por provider ID:', error);
            throw new errorHandler_js_1.AppError('Erro ao buscar pagamento. Tente novamente mais tarde.', 500);
        }
    }
    /**
     * Atualizar status do pagamento
     */
    static async updatePaymentStatus(paymentId, data) {
        try {
            return await circuitBreaker_js_1.databaseCircuitBreaker.execute(async () => {
                return await (0, retry_js_1.retryDatabase)(async () => {
                    return await (0, timeout_js_1.withDbTimeout)(async () => {
                        if (!mongoose_1.Types.ObjectId.isValid(paymentId)) {
                            throw new errorHandler_js_1.AppError('ID do pagamento inválido', 400);
                        }
                        const payment = await Payment_js_1.Payment.findById(paymentId);
                        if (!payment) {
                            throw new errorHandler_js_1.NotFoundError('Pagamento', paymentId);
                        }
                        if (data.status) {
                            payment.status = data.status;
                            payment.statusHistory.push({
                                status: data.status,
                                changedAt: new Date(),
                            });
                        }
                        if (data.amountPaid !== undefined)
                            payment.amountPaid = data.amountPaid;
                        if (data.paidAt)
                            payment.paidAt = new Date(data.paidAt);
                        if (data.processedAt)
                            payment.processedAt = new Date(data.processedAt);
                        if (data.refundedAt)
                            payment.refundedAt = new Date(data.refundedAt);
                        if (data.providerPaymentId)
                            payment.providerPaymentId = data.providerPaymentId;
                        if (data.providerSubscriptionId)
                            payment.providerSubscriptionId = data.providerSubscriptionId;
                        if (data.webhookReceived !== undefined)
                            payment.webhookReceived = data.webhookReceived;
                        if (data.webhookProcessedAt)
                            payment.webhookProcessedAt = new Date(data.webhookProcessedAt);
                        if (data.webhookPayload)
                            payment.webhookPayload = data.webhookPayload;
                        if (data.notes)
                            payment.notes = data.notes;
                        await payment.save();
                        logger_js_1.logger.info(`Status do pagamento ${paymentId} atualizado para ${payment.status}`);
                        return payment;
                    }, 'PaymentService.updatePaymentStatus');
                }, 'PaymentService.updatePaymentStatus');
            });
        }
        catch (error) {
            if (error instanceof errorHandler_js_1.AppError)
                throw error;
            logger_js_1.logger.error('Erro ao atualizar status do pagamento:', error);
            throw new errorHandler_js_1.AppError('Erro ao atualizar status do pagamento. Tente novamente mais tarde.', 500);
        }
    }
    /**
     * Obter pagamentos pendentes (para jobs)
     */
    static async getPendingPayments() {
        try {
            return await circuitBreaker_js_1.databaseCircuitBreaker.execute(async () => {
                return await (0, retry_js_1.retryDatabase)(async () => {
                    return await (0, timeout_js_1.withDbTimeout)(async () => {
                        return Payment_js_1.Payment.find({
                            status: { $in: ['pending', 'processing'] },
                        }).sort({ dueDate: 1 });
                    }, 'PaymentService.getPendingPayments');
                }, 'PaymentService.getPendingPayments');
            });
        }
        catch (error) {
            logger_js_1.logger.error('Erro ao buscar pagamentos pendentes:', error);
            throw new errorHandler_js_1.AppError('Erro ao buscar pagamentos pendentes. Tente novamente mais tarde.', 500);
        }
    }
    /**
     * Obter pagamentos por assinatura
     */
    static async getPaymentsBySubscription(subscriptionId) {
        try {
            return await circuitBreaker_js_1.databaseCircuitBreaker.execute(async () => {
                return await (0, retry_js_1.retryDatabase)(async () => {
                    return await (0, timeout_js_1.withDbTimeout)(async () => {
                        if (!mongoose_1.Types.ObjectId.isValid(subscriptionId)) {
                            throw new errorHandler_js_1.AppError('ID da assinatura inválido', 400);
                        }
                        return Payment_js_1.Payment.find({ subscriptionId: new mongoose_1.Types.ObjectId(subscriptionId) })
                            .sort({ createdAt: -1 });
                    }, 'PaymentService.getPaymentsBySubscription');
                }, 'PaymentService.getPaymentsBySubscription');
            });
        }
        catch (error) {
            if (error instanceof errorHandler_js_1.AppError)
                throw error;
            logger_js_1.logger.error('Erro ao buscar pagamentos da assinatura:', error);
            throw new errorHandler_js_1.AppError('Erro ao buscar pagamentos. Tente novamente mais tarde.', 500);
        }
    }
}
exports.PaymentService = PaymentService;
//# sourceMappingURL=PaymentService.js.map