import { IPayment, PaymentStatus, PaymentMethod, PaymentProvider } from '../models/Payment.js';
export interface CreatePaymentData {
    companyId: string;
    subscriptionId?: string;
    userId: string;
    amount: number;
    currency?: 'BRL' | 'USD';
    transactionType: 'subscription' | 'one_time' | 'consulting' | 'upgrade' | 'renewal';
    paymentMethod: PaymentMethod;
    paymentProvider: PaymentProvider;
    providerPaymentId?: string;
    providerSubscriptionId?: string;
    dueDate: Date;
    billingPeriod: {
        start: Date;
        end: Date;
    };
    items: Array<{
        description: string;
        quantity: number;
        unitPrice: number;
        totalPrice: number;
        type: 'plan' | 'user' | 'consulting' | 'custom';
        metadata?: Record<string, any>;
    }>;
    discounts?: Array<{
        type: 'percentage' | 'fixed';
        value: number;
        description: string;
        amount: number;
    }>;
    fees?: Array<{
        type: 'payment_gateway' | 'installment' | 'tax';
        description: string;
        amount: number;
    }>;
    boletoUrl?: string;
    boletoBarcode?: string;
    pixQrCode?: string;
    pixCopiaCola?: string;
    cardLastDigits?: string;
    cardBrand?: string;
    notes?: string;
    metadata?: Record<string, any>;
}
export interface UpdatePaymentData {
    status?: PaymentStatus;
    amountPaid?: number;
    paidAt?: Date;
    processedAt?: Date;
    refundedAt?: Date;
    providerPaymentId?: string;
    providerSubscriptionId?: string;
    webhookReceived?: boolean;
    webhookProcessedAt?: Date;
    webhookPayload?: any;
    notes?: string;
}
export declare class PaymentService {
    /**
     * Criar um novo registro de pagamento
     */
    static createPayment(data: CreatePaymentData): Promise<IPayment>;
    /**
     * Confirmar pagamento (webhook)
     */
    static confirmPayment(providerPaymentId: string, provider: PaymentProvider, amountPaid: number, paidAt: Date, metadata?: Record<string, any>): Promise<IPayment>;
    /**
     * Marcar pagamento como falho
     */
    static failPayment(providerPaymentId: string, reason: string): Promise<IPayment>;
    /**
     * Estornar pagamento
     */
    static refundPayment(paymentId: string, userId: string, reason?: string): Promise<IPayment>;
    /**
     * Obter pagamento por ID
     */
    static getPaymentById(paymentId: string): Promise<IPayment>;
    /**
     * Obter pagamentos por empresa
     */
    static getPaymentsByCompany(companyId: string, pagination?: {
        page?: number;
        limit?: number;
    }): Promise<{
        payments: IPayment[];
        total: number;
        totalPages: number;
    }>;
    /**
     * Obter todos os pagamentos (admin)
     */
    static getAllPayments(filters?: {
        status?: PaymentStatus;
        companyId?: string;
        startDate?: Date;
        endDate?: Date;
    }, pagination?: {
        page?: number;
        limit?: number;
    }): Promise<{
        payments: IPayment[];
        total: number;
        totalPages: number;
    }>;
    /**
     * Obter métricas de pagamento (admin)
     */
    static getPaymentMetrics(): Promise<{
        totalRevenue: number;
        monthlyRevenue: number;
        pendingPayments: number;
        failedPayments: number;
        refundedPayments: number;
        byMethod: Record<string, number>;
        byStatus: Record<string, number>;
        recentPayments: IPayment[];
    }>;
    /**
     * Verificar pagamentos pendentes (job diário)
     */
    static checkPendingPayments(): Promise<{
        expired: number;
        overdue: number;
    }>;
    /**
   * Gerar fatura para assinatura
   */
    static generateInvoice(subscriptionId: string, userId: string): Promise<IPayment>;
}
//# sourceMappingURL=PaymentService.d.ts.map