"use strict";
// backend/src/jobs/PaymentJobs.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentJobs = void 0;
const PaymentService_js_1 = require("../services/PaymentService.js");
const PaymentOrchestrator_js_1 = require("../services/PaymentOrchestrator.js");
const SubscriptionService_js_1 = require("../services/SubscriptionService.js");
const logger_js_1 = require("../utils/logger.js");
const payment_js_1 = require("../config/payment.js");
class PaymentJobs {
    static orchestrator;
    /**
     * Inicializar o orquestrador
     */
    static async initialize() {
        if (!PaymentJobs.orchestrator) {
            PaymentJobs.orchestrator = PaymentOrchestrator_js_1.PaymentOrchestrator.getInstance();
            await PaymentJobs.orchestrator.initialize();
        }
    }
    /**
     * Verificar pagamentos pendentes
     * Deve ser executado a cada 6 horas
     */
    static async checkPendingPayments() {
        await PaymentJobs.initialize();
        const result = { processed: 0, expired: 0, errors: 0 };
        try {
            // Buscar pagamentos pendentes com data de vencimento passada
            const pendingPayments = await PaymentService_js_1.PaymentService.getPendingPayments();
            logger_js_1.logger.info(`[PaymentJobs] Verificando ${pendingPayments.length} pagamentos pendentes`);
            for (const payment of pendingPayments) {
                try {
                    // Verificar se o pagamento expirou
                    if (payment.dueDate && new Date(payment.dueDate) < new Date()) {
                        await PaymentService_js_1.PaymentService.updatePaymentStatus(payment._id.toString(), {
                            status: 'expired',
                        });
                        result.expired++;
                        logger_js_1.logger.info(`[PaymentJobs] Pagamento expirado: ${payment._id}`);
                        continue;
                    }
                    // Se o gateway estiver ativo, tentar verificar o status
                    if (payment_js_1.paymentConfig.enabled && payment.providerPaymentId) {
                        try {
                            const response = await PaymentJobs.orchestrator.confirmPayment({
                                paymentId: payment.providerPaymentId,
                            });
                            if (response.success && response.status === 'paid') {
                                await PaymentService_js_1.PaymentService.updatePaymentStatus(payment._id.toString(), {
                                    status: 'paid',
                                    paidAt: new Date(),
                                });
                                // Ativar assinatura se houver
                                if (payment.subscriptionId) {
                                    await SubscriptionService_js_1.SubscriptionService.activateSubscription(payment.subscriptionId.toString());
                                }
                                result.processed++;
                                logger_js_1.logger.info(`[PaymentJobs] Pagamento confirmado: ${payment._id}`);
                            }
                        }
                        catch (error) {
                            logger_js_1.logger.error(`[PaymentJobs] Erro ao verificar pagamento ${payment._id}:`, error);
                            result.errors++;
                        }
                    }
                }
                catch (error) {
                    logger_js_1.logger.error(`[PaymentJobs] Erro ao processar pagamento ${payment._id}:`, error);
                    result.errors++;
                }
            }
            logger_js_1.logger.info(`[PaymentJobs] Concluído: ${result.processed} processados, ${result.expired} expirados, ${result.errors} erros`);
            return result;
        }
        catch (error) {
            logger_js_1.logger.error('[PaymentJobs] Erro ao verificar pagamentos pendentes:', error);
            throw error;
        }
    }
    /**
     * Processar pagamentos recorrentes (renovações)
     * Deve ser executado diariamente
     */
    static async processRecurringPayments() {
        await PaymentJobs.initialize();
        const result = { processed: 0, failed: 0, errors: 0 };
        try {
            // Buscar assinaturas ativas que vão expirar em até 7 dias
            const expiringSoon = await SubscriptionService_js_1.SubscriptionService.getSubscriptionsExpiringSoon(7);
            logger_js_1.logger.info(`[PaymentJobs] Verificando ${expiringSoon.length} assinaturas para renovação`);
            for (const subscription of expiringSoon) {
                try {
                    if (!subscription.autoRenew)
                        continue;
                    // Obter o nome do plano do planId populado
                    const planName = subscription.planName || 'Plano';
                    const companyId = subscription.companyId.toString();
                    const userId = subscription.userId.toString();
                    // Criar pagamento de renovação
                    const payment = await PaymentService_js_1.PaymentService.createPayment({
                        companyId: companyId,
                        userId: userId,
                        subscriptionId: subscription._id.toString(),
                        amount: subscription.amount,
                        currency: subscription.currency || 'BRL',
                        transactionType: 'subscription',
                        paymentMethod: 'credit_card',
                        paymentProvider: 'manual',
                        description: `Renovação de assinatura - ${planName}`,
                        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                        billingPeriod: {
                            start: new Date(),
                            end: new Date(subscription.endDate),
                        },
                        items: [
                            {
                                description: `Plano ${planName}`,
                                quantity: 1,
                                unitPrice: subscription.amount,
                                totalPrice: subscription.amount,
                                type: 'plan',
                            },
                        ],
                    });
                    // Se o gateway estiver ativo, tentar processar automaticamente
                    if (payment_js_1.paymentConfig.enabled) {
                        // TODO: Implementar cobrança automática via gateway
                        // Por enquanto, apenas registra
                        logger_js_1.logger.info(`[PaymentJobs] Pagamento de renovação criado: ${payment._id}`);
                    }
                    result.processed++;
                }
                catch (error) {
                    logger_js_1.logger.error(`[PaymentJobs] Erro ao processar renovação ${subscription._id}:`, error);
                    result.errors++;
                }
            }
            return result;
        }
        catch (error) {
            logger_js_1.logger.error('[PaymentJobs] Erro ao processar renovações:', error);
            throw error;
        }
    }
    /**
     * Job para processar webhooks pendentes
     * Deve ser executado a cada hora
     */
    static async processPendingWebhooks() {
        const result = { processed: 0, errors: 0 };
        try {
            // Buscar webhooks pendentes (se implementado)
            // Por enquanto, apenas log
            logger_js_1.logger.info('[PaymentJobs] Processando webhooks pendentes...');
            // TODO: Implementar fila de webhooks
            // Por enquanto, apenas retorna
            return result;
        }
        catch (error) {
            logger_js_1.logger.error('[PaymentJobs] Erro ao processar webhooks pendentes:', error);
            throw error;
        }
    }
}
exports.PaymentJobs = PaymentJobs;
//# sourceMappingURL=PaymentJobs.js.map