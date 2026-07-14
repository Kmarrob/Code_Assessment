// backend/src/services/StripeService.ts

import {
  BasePaymentGateway,
  PaymentGatewayService,
  CreatePaymentParams,
  ConfirmPaymentParams,
  RefundPaymentParams,
  PaymentGatewayResponse,
  PaymentWebhookData,
} from './PaymentGatewayService.js';
import { stripeConfig, paymentConfig } from '../config/payment.js';
import { logger } from '../utils/logger.js';
import { AppError } from '../middleware/errorHandler.js';

export class StripeService extends BasePaymentGateway implements PaymentGatewayService {
  name: string = 'Stripe';
  enabled: boolean = paymentConfig.enabled && paymentConfig.provider === 'stripe';

  private stripe: any = null;
  private initialized: boolean = false;

  async initialize(): Promise<void> {
    if (!this.enabled) {
      logger.info('[Stripe] Serviço desativado. Defina PAYMENT_GATEWAY_ENABLED=true e PAYMENT_GATEWAY_PROVIDER=stripe para ativar.');
      return;
    }

    try {
      // Importação dinâmica para evitar erro de módulo não encontrado
      const stripeModule = await import('stripe');
      this.stripe = new stripeModule.default(stripeConfig.secretKey, {
        apiVersion: '2025-02-24.acacia',
      });
      this.initialized = true;
      logger.info('[Stripe] Serviço inicializado com sucesso');
    } catch (error) {
      logger.error('[Stripe] Erro ao inicializar:', error);
      throw new AppError('Erro ao inicializar serviço Stripe', 500);
    }
  }

  async createPayment(params: CreatePaymentParams): Promise<PaymentGatewayResponse> {
    if (!this.enabled || !this.initialized) {
      this.log('createPayment (MOCK)', params);
      return this.mockCreatePayment(params);
    }

    try {
      // TODO: Implementar criação de payment intent
      // Por enquanto, retorna mock
      this.log('createPayment (REAL - TODO)', params);
      return this.mockCreatePayment(params);
    } catch (error) {
      logger.error('[Stripe] Erro ao criar pagamento:', error);
      return {
        success: false,
        paymentId: '',
        status: 'failed',
        providerResponse: error,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      };
    }
  }

  async confirmPayment(params: ConfirmPaymentParams): Promise<PaymentGatewayResponse> {
    if (!this.enabled || !this.initialized) {
      this.log('confirmPayment (MOCK)', params);
      return this.mockConfirmPayment(params.paymentId);
    }

    try {
      // TODO: Implementar confirmação de pagamento
      this.log('confirmPayment (REAL - TODO)', params);
      return this.mockConfirmPayment(params.paymentId);
    } catch (error) {
      logger.error('[Stripe] Erro ao confirmar pagamento:', error);
      return {
        success: false,
        paymentId: params.paymentId,
        status: 'failed',
        providerResponse: error,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      };
    }
  }

  async refundPayment(params: RefundPaymentParams): Promise<PaymentGatewayResponse> {
    if (!this.enabled || !this.initialized) {
      this.log('refundPayment (MOCK)', params);
      return this.mockRefundPayment(params.paymentId);
    }

    try {
      // TODO: Implementar estorno de pagamento
      this.log('refundPayment (REAL - TODO)', params);
      return this.mockRefundPayment(params.paymentId);
    } catch (error) {
      logger.error('[Stripe] Erro ao estornar pagamento:', error);
      return {
        success: false,
        paymentId: params.paymentId,
        status: 'failed',
        providerResponse: error,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      };
    }
  }

  async handleWebhook(data: any, headers: any): Promise<PaymentWebhookData> {
    if (!this.enabled || !this.initialized) {
      this.log('handleWebhook (MOCK)', { data, headers });
      // Simular webhook
      const event = data?.type || 'payment_intent.succeeded';
      const paymentId = data?.data?.object?.id || `mock_${Date.now()}`;
      return {
        provider: this.name,
        event,
        paymentId,
        status: event.includes('succeeded') ? 'paid' : 'pending',
        paidAt: event.includes('succeeded') ? new Date().toISOString() : undefined,
        metadata: data?.data?.object?.metadata || {},
      };
    }

    try {
      // TODO: Implementar validação de webhook
      const sig = headers['stripe-signature'];
      // const event = this.stripe.webhooks.constructEvent(data, sig, stripeConfig.webhookSecret);

      this.log('handleWebhook (REAL - TODO)', { data, headers });
      return {
        provider: this.name,
        event: data?.type || 'unknown',
        paymentId: data?.data?.object?.id || 'unknown',
        status: 'paid',
        paidAt: new Date().toISOString(),
        metadata: data?.data?.object?.metadata || {},
      };
    } catch (error) {
      logger.error('[Stripe] Erro ao processar webhook:', error);
      throw error;
    }
  }

  async getHealth(): Promise<{ status: 'ok' | 'error'; message: string }> {
    if (!this.enabled) {
      return { status: 'ok', message: 'Stripe desativado (mock mode)' };
    }

    if (!this.initialized) {
      return { status: 'error', message: 'Stripe não inicializado' };
    }

    try {
      // TODO: Implementar health check real
      return { status: 'ok', message: 'Stripe conectado' };
    } catch (error) {
      return {
        status: 'error',
        message: error instanceof Error ? error.message : 'Erro desconhecido',
      };
    }
  }
}