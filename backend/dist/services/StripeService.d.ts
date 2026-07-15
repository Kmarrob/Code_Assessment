import { BasePaymentGateway, PaymentGatewayService, CreatePaymentParams, ConfirmPaymentParams, RefundPaymentParams, PaymentGatewayResponse, PaymentWebhookData } from './PaymentGatewayService.js';
export declare class StripeService extends BasePaymentGateway implements PaymentGatewayService {
    name: string;
    enabled: boolean;
    private stripe;
    private initialized;
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
//# sourceMappingURL=StripeService.d.ts.map