"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StripeService = void 0;
const PaymentGatewayService_js_1 = require("./PaymentGatewayService.js");
const payment_js_1 = require("../config/payment.js");
const logger_js_1 = require("../utils/logger.js");
class StripeService extends PaymentGatewayService_js_1.BasePaymentGateway {
    name = 'Stripe';
    enabled = payment_js_1.paymentConfig.enabled &&
        payment_js_1.paymentConfig.provider === 'stripe';
    stripe = null;
    initialized = false;
    async initialize() {
        if (!this.enabled) {
            logger_js_1.logger.info('[Stripe] Serviço desativado. Utilizando modo MOCK.');
            this.initialized = true;
            return;
        }
        try {
            /**
             * Importação dinâmica para evitar quebra
             * quando Stripe não estiver instalado.
             */
            const stripePackage = await import('stripe');
            const Stripe = stripePackage.default ||
                stripePackage;
            this.stripe = new Stripe(payment_js_1.stripeConfig.secretKey, {
                apiVersion: '2026-06-24.dahlia',
            });
            this.initialized = true;
            logger_js_1.logger.info('[Stripe] Serviço inicializado com sucesso.');
        }
        catch (error) {
            logger_js_1.logger.warn('[Stripe] Biblioteca stripe não encontrada. Ativando MOCK.');
            this.stripe = null;
            this.initialized = true;
            logger_js_1.logger.info('[Stripe] Serviço executando em modo MOCK.');
        }
    }
    async createPayment(params) {
        if (!this.enabled ||
            !this.initialized) {
            this.log('createPayment MOCK', params);
            return this.mockCreatePayment(params);
        }
        try {
            /**
             * Implementação real Stripe futuramente.
             */
            this.log('createPayment REAL', params);
            return this.mockCreatePayment(params);
        }
        catch (error) {
            logger_js_1.logger.error('[Stripe] Erro ao criar pagamento:', error);
            return {
                success: false,
                paymentId: '',
                status: 'failed',
                providerResponse: error,
                error: error instanceof Error
                    ? error.message
                    : 'Erro desconhecido'
            };
        }
    }
    async confirmPayment(params) {
        if (!this.enabled ||
            !this.initialized) {
            return this.mockConfirmPayment(params.paymentId);
        }
        try {
            this.log('confirmPayment REAL', params);
            return this.mockConfirmPayment(params.paymentId);
        }
        catch (error) {
            logger_js_1.logger.error('[Stripe] Erro confirmar pagamento:', error);
            return {
                success: false,
                paymentId: params.paymentId,
                status: 'failed',
                providerResponse: error,
                error: error instanceof Error
                    ? error.message
                    : 'Erro desconhecido'
            };
        }
    }
    async refundPayment(params) {
        if (!this.enabled ||
            !this.initialized) {
            return this.mockRefundPayment(params.paymentId);
        }
        try {
            this.log('refundPayment REAL', params);
            return this.mockRefundPayment(params.paymentId);
        }
        catch (error) {
            logger_js_1.logger.error('[Stripe] Erro refund:', error);
            return {
                success: false,
                paymentId: params.paymentId,
                status: 'failed',
                providerResponse: error,
                error: error instanceof Error
                    ? error.message
                    : 'Erro desconhecido'
            };
        }
    }
    async handleWebhook(data, headers) {
        if (!this.enabled ||
            !this.initialized) {
            const event = data?.type ??
                'payment_intent.succeeded';
            return {
                provider: this.name,
                event,
                paymentId: data?.data?.object?.id ??
                    `mock_${Date.now()}`,
                status: event.includes('succeeded')
                    ? 'paid'
                    : 'pending',
                paidAt: event.includes('succeeded')
                    ? new Date().toISOString()
                    : undefined,
                metadata: data?.data?.object?.metadata ?? {}
            };
        }
        try {
            const signature = headers['stripe-signature'];
            /**
             * Ativar quando webhook real estiver pronto.
             *
             * this.stripe.webhooks.constructEvent(...)
             */
            logger_js_1.logger.info('[Stripe] Webhook recebido.');
            return {
                provider: this.name,
                event: data?.type ??
                    'unknown',
                paymentId: data?.data?.object?.id ??
                    'unknown',
                status: 'paid',
                paidAt: new Date().toISOString(),
                metadata: data?.data?.object?.metadata ?? {}
            };
        }
        catch (error) {
            logger_js_1.logger.error('[Stripe] Erro webhook:', error);
            throw error;
        }
    }
    async getHealth() {
        if (!this.enabled) {
            return {
                status: 'ok',
                message: 'Stripe desativado (mock mode)'
            };
        }
        if (!this.initialized) {
            return {
                status: 'error',
                message: 'Stripe não inicializado'
            };
        }
        return {
            status: 'ok',
            message: 'Stripe conectado'
        };
    }
}
exports.StripeService = StripeService;
//# sourceMappingURL=StripeService.js.map