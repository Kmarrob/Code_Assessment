import { PaymentGatewayService, CreatePaymentParams, ConfirmPaymentParams, RefundPaymentParams, PaymentGatewayResponse, PaymentWebhookData } from './PaymentGatewayService.js';
export declare class PaymentOrchestrator {
    private static instance;
    private gateway;
    private initialized;
    private constructor();
    static getInstance(): PaymentOrchestrator;
    /**
     * Inicializar o orquestrador e o gateway selecionado
     */
    initialize(): Promise<void>;
    /**
     * Verificar se o gateway está ativo
     */
    isEnabled(): boolean;
    /**
     * Obter o gateway ativo
     */
    getGateway(): PaymentGatewayService | null;
    /**
     * Criar pagamento
     */
    createPayment(params: CreatePaymentParams): Promise<PaymentGatewayResponse>;
    /**
     * Confirmar pagamento
     */
    confirmPayment(params: ConfirmPaymentParams): Promise<PaymentGatewayResponse>;
    /**
     * Estornar pagamento
     */
    refundPayment(params: RefundPaymentParams): Promise<PaymentGatewayResponse>;
    /**
     * Processar webhook
     */
    handleWebhook(data: any, headers: any): Promise<PaymentWebhookData>;
    /**
     * Verificar saúde do gateway
     */
    getHealth(): Promise<{
        status: 'ok' | 'error';
        message: string;
        provider: string;
        enabled: boolean;
    }>;
    /**
     * Obter status do orquestrador
     */
    getStatus(): {
        initialized: boolean;
        enabled: boolean;
        provider: string;
        mode: string;
    };
}
//# sourceMappingURL=PaymentOrchestrator.d.ts.map