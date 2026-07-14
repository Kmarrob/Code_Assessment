import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/index.js';
export declare class PaymentController {
    /**
     * Criar novo pagamento
     * POST /api/payments
     * Acesso: REP (da empresa) ou ADMIN
     */
    static createPayment(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Webhook para confirmar pagamento
     * POST /api/payments/webhook
     * Acesso: Público (provedor de pagamento)
     */
    static webhook(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Confirmar pagamento manualmente (admin)
     * POST /api/admin/payments/:id/confirm
     * Acesso: ADMIN
     */
    static confirmPaymentManually(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Estornar pagamento (admin)
     * POST /api/admin/payments/:id/refund
     * Acesso: ADMIN
     */
    static refundPayment(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Obter pagamento por ID
     * GET /api/payments/:id
     * Acesso: ADMIN ou REP da empresa
     */
    static getPaymentById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Listar pagamentos da empresa
     * GET /api/payments
     * Acesso: REP da empresa ou ADMIN
     */
    static listPayments(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Listar todos os pagamentos (admin)
     * GET /api/admin/payments
     * Acesso: ADMIN
     */
    static listAllPayments(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Obter métricas de pagamento (admin)
     * GET /api/admin/payments/metrics
     * Acesso: ADMIN
     */
    static getMetrics(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Gerar fatura para assinatura
     * POST /api/subscriptions/:subscriptionId/invoice
     * Acesso: ADMIN ou REP da empresa
     */
    static generateInvoice(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
}
//# sourceMappingURL=PaymentController.d.ts.map