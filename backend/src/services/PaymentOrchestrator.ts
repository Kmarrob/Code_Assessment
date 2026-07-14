// backend/src/services/PaymentOrchestrator.ts

import { paymentConfig, getGatewayConfig } from '../config/payment.js';
import { PaymentGatewayService, CreatePaymentParams, ConfirmPaymentParams, RefundPaymentParams, PaymentGatewayResponse, PaymentWebhookData } from './PaymentGatewayService.js';
import { StripeService } from './StripeService.js';
import { PagSeguroService } from './PagSeguroService.js';
import { MercadoPagoService } from './MercadoPagoService.js';
import { logger } from '../utils/logger.js';
import { AppError } from '../middleware/errorHandler.js';

export class PaymentOrchestrator {
  private static instance: PaymentOrchestrator;
  private gateway: PaymentGatewayService | null = null;
  private initialized: boolean = false;

  private constructor() {}

  static getInstance(): PaymentOrchestrator {
    if (!PaymentOrchestrator.instance) {
      PaymentOrchestrator.instance = new PaymentOrchestrator();
    }
    return PaymentOrchestrator.instance;
  }

  /**
   * Inicializar o orquestrador e o gateway selecionado
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    const config = getGatewayConfig();

    if (!config.enabled) {
      logger.warn('[PaymentOrchestrator] Gateway de pagamento desativado. Usando modo MOCK.');
      this.initialized = true;
      return;
    }

    logger.info(`[PaymentOrchestrator] Inicializando gateway: ${config.provider} (${config.mode})`);

    try {
      switch (config.provider) {
        case 'stripe':
          this.gateway = new StripeService();
          break;
        case 'pagseguro':
          this.gateway = new PagSeguroService();
          break;
        case 'mercadopago':
          this.gateway = new MercadoPagoService();
          break;
        default:
          logger.warn(`[PaymentOrchestrator] Provider ${config.provider} não suportado. Usando modo MOCK.`);
          this.gateway = null;
      }

      if (this.gateway) {
        await this.gateway.initialize();
        logger.info(`[PaymentOrchestrator] Gateway ${this.gateway.name} inicializado com sucesso`);
      }

      this.initialized = true;
    } catch (error) {
      logger.error('[PaymentOrchestrator] Erro ao inicializar:', error);
      this.gateway = null;
      this.initialized = true;
      throw new AppError('Erro ao inicializar gateway de pagamento', 500);
    }
  }

  /**
   * Verificar se o gateway está ativo
   */
  isEnabled(): boolean {
    return paymentConfig.enabled && this.gateway !== null && this.gateway.enabled;
  }

  /**
   * Obter o gateway ativo
   */
  getGateway(): PaymentGatewayService | null {
    return this.gateway;
  }

  /**
   * Criar pagamento
   */
  async createPayment(params: CreatePaymentParams): Promise<PaymentGatewayResponse> {
    if (!this.initialized) {
      await this.initialize();
    }

    if (!this.isEnabled()) {
      logger.info('[PaymentOrchestrator] Modo MOCK - Criando pagamento simulado');
      const mockService = new StripeService(); // Usar Stripe como mock base
      return mockService.createPayment(params);
    }

    try {
      logger.info(`[PaymentOrchestrator] Criando pagamento via ${this.gateway?.name}`);
      return await this.gateway!.createPayment(params);
    } catch (error) {
      logger.error('[PaymentOrchestrator] Erro ao criar pagamento:', error);
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
  async confirmPayment(params: ConfirmPaymentParams): Promise<PaymentGatewayResponse> {
    if (!this.initialized) {
      await this.initialize();
    }

    if (!this.isEnabled()) {
      logger.info('[PaymentOrchestrator] Modo MOCK - Confirmando pagamento simulado');
      const mockService = new StripeService();
      return mockService.confirmPayment(params);
    }

    try {
      logger.info(`[PaymentOrchestrator] Confirmando pagamento via ${this.gateway?.name}`);
      return await this.gateway!.confirmPayment(params);
    } catch (error) {
      logger.error('[PaymentOrchestrator] Erro ao confirmar pagamento:', error);
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
  async refundPayment(params: RefundPaymentParams): Promise<PaymentGatewayResponse> {
    if (!this.initialized) {
      await this.initialize();
    }

    if (!this.isEnabled()) {
      logger.info('[PaymentOrchestrator] Modo MOCK - Estornando pagamento simulado');
      const mockService = new StripeService();
      return mockService.refundPayment(params);
    }

    try {
      logger.info(`[PaymentOrchestrator] Estornando pagamento via ${this.gateway?.name}`);
      return await this.gateway!.refundPayment(params);
    } catch (error) {
      logger.error('[PaymentOrchestrator] Erro ao estornar pagamento:', error);
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
  async handleWebhook(data: any, headers: any): Promise<PaymentWebhookData> {
    if (!this.initialized) {
      await this.initialize();
    }

    if (!this.isEnabled()) {
      logger.info('[PaymentOrchestrator] Modo MOCK - Processando webhook simulado');
      const mockService = new StripeService();
      return mockService.handleWebhook(data, headers);
    }

    try {
      logger.info(`[PaymentOrchestrator] Processando webhook via ${this.gateway?.name}`);
      return await this.gateway!.handleWebhook(data, headers);
    } catch (error) {
      logger.error('[PaymentOrchestrator] Erro ao processar webhook:', error);
      throw error;
    }
  }

  /**
   * Verificar saúde do gateway
   */
  async getHealth(): Promise<{ status: 'ok' | 'error'; message: string; provider: string; enabled: boolean }> {
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
      const health = await this.gateway!.getHealth();
      return {
        ...health,
        provider: this.gateway!.name,
        enabled: true,
      };
    } catch (error) {
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
  getStatus(): {
    initialized: boolean;
    enabled: boolean;
    provider: string;
    mode: string;
  } {
    return {
      initialized: this.initialized,
      enabled: this.isEnabled(),
      provider: this.gateway?.name || 'mock',
      mode: paymentConfig.mode,
    };
  }
}