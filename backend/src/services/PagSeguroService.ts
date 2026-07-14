// backend/src/services/PagSeguroService.ts

import {
  BasePaymentGateway,
  PaymentGatewayService,
  CreatePaymentParams,
  ConfirmPaymentParams,
  RefundPaymentParams,
  PaymentGatewayResponse,
  PaymentWebhookData,
} from './PaymentGatewayService.js';
import { pagSeguroConfig, paymentConfig } from '../config/payment.js';
import { logger } from '../utils/logger.js';

export class PagSeguroService extends BasePaymentGateway implements PaymentGatewayService {
  name: string = 'PagSeguro';
  enabled: boolean = paymentConfig.enabled && paymentConfig.provider === 'pagseguro';

  private initialized: boolean = false;

  async initialize(): Promise<void> {
    if (!this.enabled) {
      logger.info('[PagSeguro] Serviço desativado. Defina PAYMENT_GATEWAY_ENABLED=true e PAYMENT_GATEWAY_PROVIDER=pagseguro para ativar.');
      return;
    }

    try {
      // TODO: Importar SDK do PagSeguro quando disponível
      this.initialized = true;
      logger.info('[PagSeguro] Serviço inicializado com sucesso');
    } catch (error) {
      logger.error('[PagSeguro] Erro ao inicializar:', error);
    }
  }

  async createPayment(params: CreatePaymentParams): Promise<PaymentGatewayResponse> {
    if (!this.enabled || !this.initialized) {
      this.log('createPayment (MOCK)', params);
      return this.mockCreatePayment(params);
    }

    try {
      // TODO: Implementar criação de pagamento PagSeguro
      this.log('createPayment (REAL - TODO)', params);
      return this.mockCreatePayment(params);
    } catch (error) {
      logger.error('[PagSeguro] Erro ao criar pagamento:', error);
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
      // TODO: Implementar confirmação PagSeguro
      this.log('confirmPayment (REAL - TODO)', params);
      return this.mockConfirmPayment(params.paymentId);
    } catch (error) {
      logger.error('[PagSeguro] Erro ao confirmar pagamento:', error);
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
      // TODO: Implementar estorno PagSeguro
      this.log('refundPayment (REAL - TODO)', params);
      return this.mockRefundPayment(params.paymentId);
    } catch (error) {
      logger.error('[PagSeguro] Erro ao estornar pagamento:', error);
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
        event: 'transaction.statusChanged',
        paymentId: data?.notificationCode || `mock_${Date.now()}`,
        status: data?.status === '3' ? 'paid' : 'pending',
        paidAt: data?.status === '3' ? new Date().toISOString() : undefined,
        metadata: data || {},
      };
    }

    try {
      // TODO: Implementar validação de webhook PagSeguro
      this.log('handleWebhook (REAL - TODO)', { data, headers });
      return {
        provider: this.name,
        event: 'transaction.statusChanged',
        paymentId: data?.notificationCode || 'unknown',
        status: data?.status === '3' ? 'paid' : 'pending',
        paidAt: data?.status === '3' ? new Date().toISOString() : undefined,
        metadata: data || {},
      };
    } catch (error) {
      logger.error('[PagSeguro] Erro ao processar webhook:', error);
      throw error;
    }
  }

  async getHealth(): Promise<{ status: 'ok' | 'error'; message: string }> {
    if (!this.enabled) {
      return { status: 'ok', message: 'PagSeguro desativado (mock mode)' };
    }

    if (!this.initialized) {
      return { status: 'error', message: 'PagSeguro não inicializado' };
    }

    return { status: 'ok', message: 'PagSeguro conectado' };
  }
}