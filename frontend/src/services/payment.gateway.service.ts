// frontend/src/services/payment.gateway.service.ts

import api from './api.js';
import { ApiResponse } from '../types/index.js';

export interface PaymentGatewayStatus {
  initialized: boolean;
  enabled: boolean;
  provider: string;
  mode: 'sandbox' | 'production';
}

export interface CreatePaymentRequest {
  amount: number;
  description: string;
  method: 'credit_card' | 'boleto' | 'pix' | 'bank_transfer';
  cardData?: {
    number: string;
    expiryMonth: number;
    expiryYear: number;
    cvv: string;
    holderName: string;
  };
  installments?: number;
  returnUrl?: string;
}

export interface CreatePaymentResponse {
  paymentId: string;
  status: 'pending' | 'processing' | 'paid' | 'failed';
  redirectUrl?: string;
  boletoUrl?: string;
  boletoBarcode?: string;
  pixQrCode?: string;
  pixCopiaCola?: string;
  message?: string;
}

export interface PaymentWebhookResponse {
  success: boolean;
  message: string;
}

export const paymentGatewayService = {
  /**
   * Obter status do gateway
   * GET /api/payments/webhook/health
   */
  async getGatewayStatus(): Promise<PaymentGatewayStatus> {
    const response = await api.get<ApiResponse<PaymentGatewayStatus>>(
      '/payments/webhook/health'
    );
    return response.data.data;
  },

  /**
   * Criar pagamento via gateway
   * POST /api/payments
   */
  async createPayment(data: CreatePaymentRequest): Promise<CreatePaymentResponse> {
    const response = await api.post<ApiResponse<CreatePaymentResponse>>(
      '/payments',
      data
    );
    return response.data.data;
  },

  /**
   * Verificar se o gateway está ativo
   */
  async isGatewayEnabled(): Promise<boolean> {
    try {
      const status = await this.getGatewayStatus();
      return status.enabled;
    } catch {
      return false;
    }
  },

  /**
   * Processar pagamento com cartão de crédito
   */
  async processCreditCardPayment(data: {
    amount: number;
    description: string;
    cardNumber: string;
    cardHolder: string;
    expiryMonth: number;
    expiryYear: number;
    cvv: string;
    installments?: number;
  }): Promise<CreatePaymentResponse> {
    return this.createPayment({
      amount: data.amount,
      description: data.description,
      method: 'credit_card',
      cardData: {
        number: data.cardNumber,
        expiryMonth: data.expiryMonth,
        expiryYear: data.expiryYear,
        cvv: data.cvv,
        holderName: data.cardHolder,
      },
      installments: data.installments,
    });
  },

  /**
   * Processar pagamento com boleto
   */
  async processBoletoPayment(data: {
    amount: number;
    description: string;
    returnUrl?: string;
  }): Promise<CreatePaymentResponse> {
    return this.createPayment({
      amount: data.amount,
      description: data.description,
      method: 'boleto',
      returnUrl: data.returnUrl,
    });
  },

  /**
   * Processar pagamento com Pix
   */
  async processPixPayment(data: {
    amount: number;
    description: string;
  }): Promise<CreatePaymentResponse> {
    return this.createPayment({
      amount: data.amount,
      description: data.description,
      method: 'pix',
    });
  },

  /**
   * Enviar webhook manual (para testes)
   */
  async sendTestWebhook(data: any): Promise<PaymentWebhookResponse> {
    const response = await api.post<ApiResponse<PaymentWebhookResponse>>(
      '/payments/webhook',
      data
    );
    return response.data.data;
  },

  /**
   * Formatar valor para exibição
   */
  formatAmount(amount: number): string {
    return (amount / 100).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  },

  /**
   * Mascarar número de cartão
   */
  maskCardNumber(number: string): string {
    return `•••• ${number.slice(-4)}`;
  },

  /**
   * Validar número de cartão (Luhn)
   */
  validateCardNumber(number: string): boolean {
    const digits = number.replace(/\D/g, '');
    if (digits.length < 13 || digits.length > 19) return false;

    let sum = 0;
    let isEven = false;
    for (let i = digits.length - 1; i >= 0; i--) {
      let digit = parseInt(digits[i]);
      if (isEven) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      sum += digit;
      isEven = !isEven;
    }
    return sum % 10 === 0;
  },

  /**
   * Validar data de expiração do cartão
   */
  validateCardExpiry(month: number, year: number): boolean {
    const now = new Date();
    const currentYear = now.getFullYear() % 100;
    const currentMonth = now.getMonth() + 1;

    if (year < currentYear) return false;
    if (year === currentYear && month < currentMonth) return false;
    return true;
  },

  /**
   * Validar CVV
   */
  validateCardCvv(cvv: string): boolean {
    return /^\d{3,4}$/.test(cvv);
  },
};