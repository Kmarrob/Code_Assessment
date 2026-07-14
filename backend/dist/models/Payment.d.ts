import mongoose, { Model } from 'mongoose';
/**
 * Status do pagamento
 */
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded' | 'chargeback' | 'processing' | 'cancelled' | 'expired';
/**
 * Método de pagamento
 */
export type PaymentMethod = 'credit_card' | 'boleto' | 'pix' | 'bank_transfer';
/**
 * Provedor de pagamento
 */
export type PaymentProvider = 'stripe' | 'pagseguro' | 'mercadopago' | 'manual';
/**
 * Tipo de transação
 */
export type TransactionType = 'subscription' | 'one_time' | 'consulting' | 'upgrade' | 'renewal';
/**
 * Modelo de Pagamento
 */
export interface IPayment {
    _id: mongoose.Types.ObjectId;
    companyId: mongoose.Types.ObjectId;
    subscriptionId?: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
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
        changedAt: Date;
        reason?: string;
    }>;
    dueDate: Date;
    paidAt?: Date;
    processedAt?: Date;
    refundedAt?: Date;
    expiresAt?: Date;
    boletoUrl?: string;
    boletoBarcode?: string;
    pixQrCode?: string;
    pixCopiaCola?: string;
    cardLastDigits?: string;
    cardBrand?: string;
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
    discounts: Array<{
        type: 'percentage' | 'fixed';
        value: number;
        description: string;
        amount: number;
    }>;
    fees: Array<{
        type: 'payment_gateway' | 'installment' | 'tax';
        description: string;
        amount: number;
    }>;
    metadata?: Record<string, any>;
    notes?: string;
    companyName: string;
    companyCnpj?: string;
    userEmail: string;
    userName: string;
    webhookReceived?: boolean;
    webhookProcessedAt?: Date;
    webhookPayload?: any;
    createdAt: Date;
    updatedAt: Date;
    createdBy?: mongoose.Types.ObjectId;
    updatedBy?: mongoose.Types.ObjectId;
    isPaid(): boolean;
    isPending(): boolean;
    isRefunded(): boolean;
    isFailed(): boolean;
    isOverdue(): boolean;
    getStatusLabel(): string;
    getPaymentMethodLabel(): string;
    getTotalWithFees(): number;
    addStatusHistory(status: PaymentStatus, reason?: string): void;
}
export interface PaymentModel extends Model<IPayment> {
    findByCompany(companyId: string): Promise<IPayment[]>;
    findByProviderPaymentId(providerPaymentId: string): Promise<IPayment | null>;
    findPending(): Promise<IPayment[]>;
    findOverdue(): Promise<IPayment[]>;
    getTotalRevenue(startDate?: Date, endDate?: Date): Promise<{
        total: number;
    }[]>;
    getRevenueByPeriod(period: 'day' | 'month' | 'year'): Promise<any[]>;
}
export declare const Payment: PaymentModel;
//# sourceMappingURL=Payment.d.ts.map