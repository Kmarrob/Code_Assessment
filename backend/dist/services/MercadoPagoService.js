"use strict";
// backend/src/services/MercadoPagoService.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.MercadoPagoService = void 0;
const PaymentGatewayService_js_1 = require("./PaymentGatewayService.js");
const payment_js_1 = require("../config/payment.js");
const logger_js_1 = require("../utils/logger.js");
class MercadoPagoService extends PaymentGatewayService_js_1.BasePaymentGateway {
    name = 'MercadoPago';
    enabled = payment_js_1.paymentConfig.enabled && payment_js_1.paymentConfig.provider === 'mercadopago';
    initialized = false;
    async initialize() {
        if (!this.enabled) {
            logger_js_1.logger.info('[MercadoPago] Serviço desativado. Defina PAYMENT_GATEWAY_ENABLED=true e PAYMENT_GATEWAY_PROVIDER=mercadopago para ativar.');
            return;
        }
        try {
            // TODO: Importar SDK do MercadoPago quando disponível
            this.initialized = true;
            logger_js_1.logger.info('[MercadoPago] Serviço inicializado com sucesso');
        }
        catch (error) {
            logger_js_1.logger.error('[MercadoPago] Erro ao inicializar:', error);
        }
    }
    async createPayment(params) {
        if (!this.enabled || !this.initialized) {
            this.log('createPayment (MOCK)', params);
            return this.mockCreatePayment(params);
        }
        try {
            // TODO: Implementar criação de pagamento MercadoPago
            this.log('createPayment (REAL - TODO)', params);
            return this.mockCreatePayment(params);
        }
        catch (error) {
            logger_js_1.logger.error('[MercadoPago] Erro ao criar pagamento:', error);
            return {
                success: false,
                paymentId: '',
                status: 'failed',
                providerResponse: error,
                error: error instanceof Error ? error.message : 'Erro desconhecido',
            };
        }
    }
    async confirmPayment(params) {
        if (!this.enabled || !this.initialized) {
            this.log('confirmPayment (MOCK)', params);
            return this.mockConfirmPayment(params.paymentId);
        }
        try {
            // TODO: Implementar confirmação MercadoPago
            this.log('confirmPayment (REAL - TODO)', params);
            return this.mockConfirmPayment(params.paymentId);
        }
        catch (error) {
            logger_js_1.logger.error('[MercadoPago] Erro ao confirmar pagamento:', error);
            return {
                success: false,
                paymentId: params.paymentId,
                status: 'failed',
                providerResponse: error,
                error: error instanceof Error ? error.message : 'Erro desconhecido',
            };
        }
    }
    async refundPayment(params) {
        if (!this.enabled || !this.initialized) {
            this.log('refundPayment (MOCK)', params);
            return this.mockRefundPayment(params.paymentId);
        }
        try {
            // TODO: Implementar estorno MercadoPago
            this.log('refundPayment (REAL - TODO)', params);
            return this.mockRefundPayment(params.paymentId);
        }
        catch (error) {
            logger_js_1.logger.error('[MercadoPago] Erro ao estornar pagamento:', error);
            return {
                success: false,
                paymentId: params.paymentId,
                status: 'failed',
                providerResponse: error,
                error: error instanceof Error ? error.message : 'Erro desconhecido',
            };
        }
    }
    async handleWebhook(data, headers) {
        if (!this.enabled || !this.initialized) {
            this.log('handleWebhook (MOCK)', { data, headers });
            return {
                provider: this.name,
                event: data?.action || 'payment.created',
                paymentId: data?.data?.id || `mock_${Date.now()}`,
                status: data?.data?.status === 'approved' ? 'paid' : 'pending',
                paidAt: data?.data?.status === 'approved' ? new Date().toISOString() : undefined,
                metadata: data || {},
            };
        }
        try {
            // TODO: Implementar validação de webhook MercadoPago
            this.log('handleWebhook (REAL - TODO)', { data, headers });
            return {
                provider: this.name,
                event: data?.action || 'payment.created',
                paymentId: data?.data?.id || 'unknown',
                status: data?.data?.status === 'approved' ? 'paid' : 'pending',
                paidAt: data?.data?.status === 'approved' ? new Date().toISOString() : undefined,
                metadata: data || {},
            };
        }
        catch (error) {
            logger_js_1.logger.error('[MercadoPago] Erro ao processar webhook:', error);
            throw error;
        }
    }
    async getHealth() {
        if (!this.enabled) {
            return { status: 'ok', message: 'MercadoPago desativado (mock mode)' };
        }
        if (!this.initialized) {
            return { status: 'error', message: 'MercadoPago não inicializado' };
        }
        return { status: 'ok', message: 'MercadoPago conectado' };
    }
}
exports.MercadoPagoService = MercadoPagoService;
//# sourceMappingURL=MercadoPagoService.js.map