export interface PaymentGatewayResponse {
    success: boolean;
    paymentId: string;
    status: 'pending' | 'paid' | 'failed' | 'processing' | 'refunded';
    providerResponse: any;
    redirectUrl?: string;
    boletoUrl?: string;
    boletoBarcode?: string;
    pixQrCode?: string;
    pixCopiaCola?: string;
    message?: string;
    error?: string;
}
export interface CreatePaymentParams {
    amount: number;
    currency: string;
    description: string;
    customer: {
        id?: string;
        email: string;
        name: string;
        document?: string;
        phone?: string;
    };
    billingPeriod?: {
        start: string;
        end: string;
    };
    metadata?: Record<string, any>;
    method?: 'credit_card' | 'boleto' | 'pix' | 'bank_transfer';
    cardData?: {
        number: string;
        expiryMonth: number;
        expiryYear: number;
        cvv: string;
        holderName: string;
    };
    installments?: number;
    returnUrl?: string;
    webhookUrl?: string;
}
export interface ConfirmPaymentParams {
    paymentId: string;
}
export interface RefundPaymentParams {
    paymentId: string;
    amount?: number;
    reason?: string;
}
export interface PaymentWebhookData {
    provider: string;
    event: string;
    paymentId: string;
    status: string;
    amount?: number;
    paidAt?: string;
    metadata?: Record<string, any>;
}
export interface PaymentGatewayService {
    name: string;
    enabled: boolean;
    initialize(): Promise<void>;
    createPayment(params: CreatePaymentParams): Promise<PaymentGatewayResponse>;
    confirmPayment(params: ConfirmPaymentParams): Promise<PaymentGatewayResponse>;
    refundPayment(params: RefundPaymentParams): Promise<PaymentGatewayResponse>;
    handleWebhook(data: any, headers: any): Promise<PaymentWebhookData>;
    getHealth(): Promise<{
        status: 'ok' | 'error';
        message: string;
    }>;
}
export declare abstract class BasePaymentGateway implements PaymentGatewayService {
    abstract name: string;
    abstract enabled: boolean;
    abstract initialize(): Promise<void>;
    abstract createPayment(params: CreatePaymentParams): Promise<PaymentGatewayResponse>;
    abstract confirmPayment(params: ConfirmPaymentParams): Promise<PaymentGatewayResponse>;
    abstract refundPayment(params: RefundPaymentParams): Promise<PaymentGatewayResponse>;
    abstract handleWebhook(data: any, headers: any): Promise<PaymentWebhookData>;
    abstract getHealth(): Promise<{
        status: 'ok' | 'error';
        message: string;
    }>;
    /**
     * Log de ação para simulação
     */
    protected log(action: string, data: any): void;
    /**
     * Simular delay para simular processamento real
     */
    protected simulateDelay(ms?: number): Promise<void>;
    /**
     * Método para simular criação de pagamento (quando desativado)
     */
    protected mockCreatePayment(params: CreatePaymentParams): PaymentGatewayResponse;
    /**
     * Método para simular confirmação de pagamento (quando desativado)
     */
    protected mockConfirmPayment(paymentId: string): PaymentGatewayResponse;
    /**
     * Método para simular estorno (quando desativado)
     */
    protected mockRefundPayment(paymentId: string): PaymentGatewayResponse;
}
//# sourceMappingURL=PaymentGatewayService.d.ts.map