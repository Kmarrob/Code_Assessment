import { Request, Response, NextFunction } from 'express';
export declare class PaymentWebhookController {
    private static orchestrator;
    /**
     * Inicializar o orquestrador
     */
    static initialize(): Promise<void>;
    /**
     * Webhook para receber notificações do gateway
     * POST /api/payments/webhook
     */
    static handleWebhook(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * Atualizar status do pagamento no sistema
     */
    private static updatePaymentStatus;
    /**
     * Health check do webhook
     * GET /api/payments/webhook/health
     */
    static getHealth(req: Request, res: Response, next: NextFunction): Promise<void>;
}
//# sourceMappingURL=PaymentWebhookController.d.ts.map