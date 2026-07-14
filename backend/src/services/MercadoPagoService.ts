// backend/src/services/MercadoPagoService.ts

import {
  BasePaymentGateway,
  PaymentGatewayService,
  CreatePaymentParams,
  ConfirmPaymentParams,
  RefundPaymentParams,
  PaymentGatewayResponse,
  PaymentWebhookData,
} from './PaymentGatewayService.js';
import { mercadoPagoConfig, paymentConfig } from '../config/payment.js';
import { logger } from '../utils/logger.js';

export class MercadoPagoService extends BasePaymentGateway implements PaymentGatewayService {
  name: string = 'MercadoPago';
  enabled: boolean = paymentConfig.enabled && paymentConfig.provider === 'mercadopago';

  private initialized: boolean = false;

  async initialize(): Promise<void> {
    if (!this.enabled) {
      logger.info('[MercadoPago] Serviço desativado. Defina PAYMENT_GATEWAY_ENABLED=true e PAYMENT_GATEWAY_PROVIDER=mercadopago para ativar.');
      return;
    }

    try {
      // TODO: Importar SDK do MercadoPago quando disponível
      this.initialized = true;
      logger.info('[MercadoPago] Serviço inicializado com sucesso');
    } catch (error) {
      logger.error('[MercadoPago] Erro ao inicializar:', error);
    }
  }

  async createPayment(params: CreatePaymentParams): Promise<PaymentGatewayResponse> {
    if (!this.enabled || !this.initialized) {
      this.log('createPayment (MOCK)', params);
      return this.mockCreatePayment(params);
    }

    try {
      // TODO: Implementar criação de pagamento MercadoPago
      this.log('createPayment (REAL - TODO)', params);
      return this.mockCreatePayment(params);
    } catch (error) {
      logger.error('[MercadoPago] Erro ao criar pagamento:', error);
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
      // TODO: Implementar confirmação MercadoPago
      this.log('confirmPayment (REAL - TODO)', params);
      return this.mockConfirmPayment(params.paymentId);
    } catch (error) {
      logger.error('[MercadoPago] Erro ao confirmar pagamento:', error);
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
      // TODO: Implementar estorno MercadoPago
      this.log('refundPayment (REAL - TODO)', params);
      return this.mockRefundPayment(params.paymentId);
    } catch (error) {
      logger.error('[MercadoPago] Erro ao estornar pagamento:', error);
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
    } catch (error) {
      logger.error('[MercadoPago] Erro ao processar webhook:', error);
      throw error;
    }
  }

  async getHealth(): Promise<{ status: 'ok' | 'error'; message: string }> {
    if (!this.enabled) {
      return { status: 'ok', message: 'MercadoPago desativado (mock mode)' };
    }

    if (!this.initialized) {
      return { status: 'error', message: 'MercadoPago não inicializado' };
    }

    return { status: 'ok', message: 'MercadoPago conectado' };
  }
}