// frontend/src/services/payment.service.ts
import api from './api.js';
import { ApiResponse } from '../types/index.js';

export type PaymentStatus = 
  | 'pending'
  | 'paid'
  | 'failed'
  | 'refunded'
  | 'chargeback'
  | 'processing'
  | 'cancelled'
  | 'expired';

export type PaymentMethod = 
  | 'credit_card'
  | 'boleto'
  | 'pix'
  | 'bank_transfer';

export type PaymentProvider = 
  | 'stripe'
  | 'pagseguro'
  | 'mercadopago'
  | 'manual';

export type TransactionType = 
  | 'subscription'
  | 'one_time'
  | 'consulting'
  | 'upgrade'
  | 'renewal';

export interface PaymentItem {
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  type: 'plan' | 'user' | 'consulting' | 'custom';
  metadata?: Record<string, any>;
}

export interface PaymentDiscount {
  type: 'percentage' | 'fixed';
  value: number;
  description: string;
  amount: number;
}

export interface PaymentFee {
  type: 'payment_gateway' | 'installment' | 'tax';
  description: string;
  amount: number;
}

export interface PaymentBillingPeriod {
  start: string;
  end: string;
}

export interface Payment {
  _id: string;
  companyId: string;
  subscriptionId?: string;
  userId: string;
  amount: number;
  amountPaid: number;
  amountRefunded: number;
  currency: 'BRL' | 'USD';
  transactionType: TransactionType;
  paymentMethod: PaymentMethod;
  paymentProvider: PaymentProvider;
  providerPaymentId?: string;
  providerSubscriptionId?: string;
  status: PaymentStatus;
  statusHistory: Array<{
    status: PaymentStatus;
    changedAt: string;
    reason?: string;
  }>;
  dueDate: string;
  paidAt?: string;
  processedAt?: string;
  refundedAt?: string;
  expiresAt?: string;
  boletoUrl?: string;
  boletoBarcode?: string;
  pixQrCode?: string;
  pixCopiaCola?: string;
  cardLastDigits?: string;
  cardBrand?: string;
  billingPeriod: PaymentBillingPeriod;
  items: PaymentItem[];
  discounts: PaymentDiscount[];
  fees: PaymentFee[];
  metadata?: Record<string, any>;
  notes?: string;
  companyName: string;
  companyCnpj?: string;
  userEmail: string;
  userName: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePaymentData {
  subscriptionId?: string;
  amount: number;
  currency?: 'BRL' | 'USD';
  transactionType?: TransactionType;
  paymentMethod: PaymentMethod;
  paymentProvider: PaymentProvider;
  providerPaymentId?: string;
  providerSubscriptionId?: string;
  dueDate: string;
  billingPeriod: {
    start: string;
    end: string;
  };
  items: PaymentItem[];
  discounts?: PaymentDiscount[];
  fees?: PaymentFee[];
  boletoUrl?: string;
  boletoBarcode?: string;
  pixQrCode?: string;
  pixCopiaCola?: string;
  cardLastDigits?: string;
  cardBrand?: string;
  notes?: string;
  metadata?: Record<string, any>;
}

export interface PaymentMetrics {
  totalRevenue: number;
  monthlyRevenue: number;
  pendingPayments: number;
  failedPayments: number;
  refundedPayments: number;
  byMethod: Record<string, number>;
  byStatus: Record<string, number>;
  recentPayments: Payment[];
}

export interface WebhookData {
  provider: PaymentProvider;
  paymentId: string;
  subscriptionId?: string;
  amount: number;
  status: string;
  paidAt?: string;
  metadata?: Record<string, any>;
}

export const paymentService = {
  /**
   * Criar novo pagamento
   * POST /api/payments
   */
  async createPayment(data: CreatePaymentData): Promise<Payment> {
    const response = await api.post<ApiResponse<{ payment: Payment }>>(
      '/payments',
      data
    );
    return response.data.data.payment;
  },

  /**
   * Obter pagamento por ID
   * GET /api/payments/:id
   */
  async getPaymentById(id: string): Promise<Payment> {
    const response = await api.get<ApiResponse<{ payment: Payment }>>(
      `/payments/${id}`
    );
    return response.data.data.payment;
  },

  /**
   * Listar pagamentos da empresa
   * GET /api/payments
   */
  async listPayments(params?: {
    page?: number;
    limit?: number;
  }): Promise<{ payments: Payment[]; pagination: any }> {
    const response = await api.get<ApiResponse<{ payments: Payment[]; pagination: any }>>(
      '/payments',
      { params }
    );
    return response.data.data;
  },

  /**
   * Listar todos os pagamentos (admin)
   * GET /api/admin/payments
   */
  async listAllPayments(params?: {
    page?: number;
    limit?: number;
    status?: PaymentStatus;
    companyId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<{ payments: Payment[]; pagination: any }> {
    const response = await api.get<ApiResponse<{ payments: Payment[]; pagination: any }>>(
      '/admin/payments',
      { params }
    );
    return response.data.data;
  },

  /**
   * Confirmar pagamento manualmente (admin)
   * POST /api/admin/payments/:id/confirm
   */
  async confirmPaymentManually(
    id: string,
    data: { amountPaid: number; paidAt?: string; notes?: string }
  ): Promise<Payment> {
    const response = await api.post<ApiResponse<{ payment: Payment }>>(
      `/admin/payments/${id}/confirm`,
      data
    );
    return response.data.data.payment;
  },

  /**
   * Estornar pagamento (admin)
   * POST /api/admin/payments/:id/refund
   */
  async refundPayment(id: string, reason?: string): Promise<Payment> {
    const response = await api.post<ApiResponse<{ payment: Payment }>>(
      `/admin/payments/${id}/refund`,
      { reason }
    );
    return response.data.data.payment;
  },

  /**
   * Obter métricas de pagamento (admin)
   * GET /api/admin/payments/metrics
   */
  async getMetrics(): Promise<PaymentMetrics> {
    const response = await api.get<ApiResponse<PaymentMetrics>>(
      '/admin/payments/metrics'
    );
    return response.data.data;
  },

  /**
   * Gerar fatura para assinatura
   * POST /api/subscriptions/:subscriptionId/invoice
   */
  async generateInvoice(subscriptionId: string): Promise<Payment> {
    const response = await api.post<ApiResponse<{ payment: Payment }>>(
      `/subscriptions/${subscriptionId}/invoice`
    );
    return response.data.data.payment;
  },

  /**
   * Enviar webhook de pagamento (para provedores)
   * POST /api/payments/webhook
   */
  async sendWebhook(data: WebhookData): Promise<any> {
    const response = await api.post('/payments/webhook', data);
    return response.data;
  },

  /**
   * Verificar se o pagamento está pago
   */
  isPaid(payment: Payment | null): boolean {
    if (!payment) return false;
    return payment.status === 'paid';
  },

  /**
   * Verificar se o pagamento está pendente
   */
  isPending(payment: Payment | null): boolean {
    if (!payment) return false;
    return payment.status === 'pending' || payment.status === 'processing';
  },

  /**
   * Verificar se o pagamento falhou
   */
  isFailed(payment: Payment | null): boolean {
    if (!payment) return false;
    return payment.status === 'failed';
  },

  /**
   * Verificar se o pagamento foi estornado
   */
  isRefunded(payment: Payment | null): boolean {
    if (!payment) return false;
    return payment.status === 'refunded';
  },

  /**
   * Verificar se o pagamento está atrasado
   */
  isOverdue(payment: Payment | null): boolean {
    if (!payment) return false;
    if (payment.status !== 'pending') return false;
    if (!payment.dueDate) return false;
    return new Date(payment.dueDate) < new Date();
  },

  /**
   * Obter status de forma legível
   */
  getStatusLabel(status: PaymentStatus): string {
    const statusMap: Record<PaymentStatus, string> = {
      'pending': 'Aguardando Pagamento',
      'paid': 'Pago',
      'failed': 'Falhou',
      'refunded': 'Estornado',
      'chargeback': 'Chargeback',
      'processing': 'Processando',
      'cancelled': 'Cancelado',
      'expired': 'Expirado',
    };
    return statusMap[status] || status;
  },

  /**
   * Obter cor do status
   */
  getStatusColor(status: PaymentStatus): string {
    const colorMap: Record<PaymentStatus, string> = {
      'pending': 'text-yellow-600 bg-yellow-50',
      'paid': 'text-green-600 bg-green-50',
      'failed': 'text-red-600 bg-red-50',
      'refunded': 'text-gray-600 bg-gray-50',
      'chargeback': 'text-red-600 bg-red-50',
      'processing': 'text-blue-600 bg-blue-50',
      'cancelled': 'text-gray-400 bg-gray-50',
      'expired': 'text-gray-400 bg-gray-50',
    };
    return colorMap[status] || 'text-gray-600 bg-gray-50';
  },

  /**
   * Obter método de pagamento de forma legível
   */
  getPaymentMethodLabel(method: PaymentMethod): string {
    const methodMap: Record<PaymentMethod, string> = {
      'credit_card': 'Cartão de Crédito',
      'boleto': 'Boleto Bancário',
      'pix': 'Pix',
      'bank_transfer': 'Transferência Bancária',
    };
    return methodMap[method] || method;
  },

  /**
   * Formatar valor para exibição
   */
  formatAmount(amount: number, currency: 'BRL' | 'USD' = 'BRL'): string {
    return (amount / 100).toLocaleString('pt-BR', {
      style: 'currency',
      currency: currency,
    });
  },
};