export declare class PaymentJobs {
    private static orchestrator;
    /**
     * Inicializar o orquestrador
     */
    static initialize(): Promise<void>;
    /**
     * Verificar pagamentos pendentes
     * Deve ser executado a cada 6 horas
     */
    static checkPendingPayments(): Promise<{
        processed: number;
        expired: number;
        errors: number;
    }>;
    /**
     * Processar pagamentos recorrentes (renovações)
     * Deve ser executado diariamente
     */
    static processRecurringPayments(): Promise<{
        processed: number;
        failed: number;
        errors: number;
    }>;
    /**
     * Job para processar webhooks pendentes
     * Deve ser executado a cada hora
     */
    static processPendingWebhooks(): Promise<{
        processed: number;
        errors: number;
    }>;
}
//# sourceMappingURL=PaymentJobs.d.ts.map