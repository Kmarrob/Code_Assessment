"use strict";
// backend/src/services/PaymentOrchestrator.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentOrchestrator = void 0;
const payment_js_1 = require("../config/payment.js");
const StripeService_js_1 = require("./StripeService.js");
const PagSeguroService_js_1 = require("./PagSeguroService.js");
const MercadoPagoService_js_1 = require("./MercadoPagoService.js");
const logger_js_1 = require("../utils/logger.js");
const errorHandler_js_1 = require("../middleware/errorHandler.js");
class PaymentOrchestrator {
    static instance;
    gateway = null;
    initialized = false;
    constructor() { }
    static getInstance() {
        if (!PaymentOrchestrator.instance) {
            PaymentOrchestrator.instance = new PaymentOrchestrator();
        }
        return PaymentOrchestrator.instance;
    }
    /**
     * Inicializar o orquestrador e o gateway selecionado
     */
    async initialize() {
        if (this.initialized)
            return;
        const config = (0, payment_js_1.getGatewayConfig)();
        if (!config.enabled) {
            logger_js_1.logger.warn('[PaymentOrchestrator] Gateway de pagamento desativado. Usando modo MOCK.');
            this.initialized = true;
            return;
        }
        logger_js_1.logger.info(`[PaymentOrchestrator] Inicializando gateway: ${config.provider} (${config.mode})`);
        try {
            switch (config.provider) {
                case 'stripe':
                    this.gateway = new StripeService_js_1.StripeService();
                    break;
                case 'pagseguro':
                    this.gateway = new PagSeguroService_js_1.PagSeguroService();
                    break;
                case 'mercadopago':
                    this.gateway = new MercadoPagoService_js_1.MercadoPagoService();
                    break;
                default:
                    logger_js_1.logger.warn(`[PaymentOrchestrator] Provider ${config.provider} não suportado. Usando modo MOCK.`);
                    this.gateway = null;
            }
            if (this.gateway) {
                await this.gateway.initialize();
                logger_js_1.logger.info(`[PaymentOrchestrator] Gateway ${this.gateway.name} inicializado com sucesso`);
            }
            this.initialized = true;
        }
        catch (error) {
            logger_js_1.logger.error('[PaymentOrchestrator] Erro ao inicializar:', error);
            this.gateway = null;
            this.initialized = true;
            throw new errorHandler_js_1.AppError('Erro ao inicializar gateway de pagamento', 500);
        }
    }
    /**
     * Verificar se o gateway está ativo
     */
    isEnabled() {
        return payment_js_1.paymentConfig.enabled && this.gateway !== null && this.gateway.enabled;
    }
    /**
     * Obter o gateway ativo
     */
    getGateway() {
        return this.gateway;
    }
    /**
     * Criar pagamento
     */
    async createPayment(params) {
        if (!this.initialized) {
            await this.initialize();
        }
        if (!this.isEnabled()) {
            logger_js_1.logger.info('[PaymentOrchestrator] Modo MOCK - Criando pagamento simulado');
            const mockService = new StripeService_js_1.StripeService(); // Usar Stripe como mock base
            return mockService.createPayment(params);
        }
        try {
            logger_js_1.logger.info(`[PaymentOrchestrator] Criando pagamento via ${this.gateway?.name}`);
            return await this.gateway.createPayment(params);
        }
        catch (error) {
            logger_js_1.logger.error('[PaymentOrchestrator] Erro ao criar pagamento:', error);
            return {
                success: false,
                paymentId: '',
                status: 'failed',
                providerResponse: error,
                error: error instanceof Error ? error.message : 'Erro desconhecido',
            };
        }
    }
    /**
     * Confirmar pagamento
     */
    async confirmPayment(params) {
        if (!this.initialized) {
            await this.initialize();
        }
        if (!this.isEnabled()) {
            logger_js_1.logger.info('[PaymentOrchestrator] Modo MOCK - Confirmando pagamento simulado');
            const mockService = new StripeService_js_1.StripeService();
            return mockService.confirmPayment(params);
        }
        try {
            logger_js_1.logger.info(`[PaymentOrchestrator] Confirmando pagamento via ${this.gateway?.name}`);
            return await this.gateway.confirmPayment(params);
        }
        catch (error) {
            logger_js_1.logger.error('[PaymentOrchestrator] Erro ao confirmar pagamento:', error);
            return {
                success: false,
                paymentId: params.paymentId,
                status: 'failed',
                providerResponse: error,
                error: error instanceof Error ? error.message : 'Erro desconhecido',
            };
        }
    }
    /**
     * Estornar pagamento
     */
    async refundPayment(params) {
        if (!this.initialized) {
            await this.initialize();
        }
        if (!this.isEnabled()) {
            logger_js_1.logger.info('[PaymentOrchestrator] Modo MOCK - Estornando pagamento simulado');
            const mockService = new StripeService_js_1.StripeService();
            return mockService.refundPayment(params);
        }
        try {
            logger_js_1.logger.info(`[PaymentOrchestrator] Estornando pagamento via ${this.gateway?.name}`);
            return await this.gateway.refundPayment(params);
        }
        catch (error) {
            logger_js_1.logger.error('[PaymentOrchestrator] Erro ao estornar pagamento:', error);
            return {
                success: false,
                paymentId: params.paymentId,
                status: 'failed',
                providerResponse: error,
                error: error instanceof Error ? error.message : 'Erro desconhecido',
            };
        }
    }
    /**
     * Processar webhook
     */
    async handleWebhook(data, headers) {
        if (!this.initialized) {
            await this.initialize();
        }
        if (!this.isEnabled()) {
            logger_js_1.logger.info('[PaymentOrchestrator] Modo MOCK - Processando webhook simulado');
            const mockService = new StripeService_js_1.StripeService();
            return mockService.handleWebhook(data, headers);
        }
        try {
            logger_js_1.logger.info(`[PaymentOrchestrator] Processando webhook via ${this.gateway?.name}`);
            return await this.gateway.handleWebhook(data, headers);
        }
        catch (error) {
            logger_js_1.logger.error('[PaymentOrchestrator] Erro ao processar webhook:', error);
            throw error;
        }
    }
    /**
     * Verificar saúde do gateway
     */
    async getHealth() {
        if (!this.initialized) {
            await this.initialize();
        }
        if (!this.isEnabled()) {
            return {
                status: 'ok',
                message: 'Modo MOCK ativo - Gateway desativado',
                provider: 'mock',
                enabled: false,
            };
        }
        try {
            const health = await this.gateway.getHealth();
            return {
                ...health,
                provider: this.gateway.name,
                enabled: true,
            };
        }
        catch (error) {
            return {
                status: 'error',
                message: error instanceof Error ? error.message : 'Erro desconhecido',
                provider: this.gateway?.name || 'unknown',
                enabled: true,
            };
        }
    }
    /**
     * Obter status do orquestrador
     */
    getStatus() {
        return {
            initialized: this.initialized,
            enabled: this.isEnabled(),
            provider: this.gateway?.name || 'mock',
            mode: payment_js_1.paymentConfig.mode,
        };
    }
}
exports.PaymentOrchestrator = PaymentOrchestrator;
//# sourceMappingURL=PaymentOrchestrator.js.map