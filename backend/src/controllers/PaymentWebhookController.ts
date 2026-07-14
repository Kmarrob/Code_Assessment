// backend/src/controllers/PaymentWebhookController.ts

import { Request, Response, NextFunction } from 'express';
import { PaymentOrchestrator } from '../services/PaymentOrchestrator.js';
import { PaymentService } from '../services/PaymentService.js';
import { logger } from '../utils/logger.js';
import { AppError } from '../middleware/errorHandler.js';

export class PaymentWebhookController {
  private static orchestrator: PaymentOrchestrator;

  /**
   * Inicializar o orquestrador
   */
  static async initialize(): Promise<void> {
    if (!PaymentWebhookController.orchestrator) {
      PaymentWebhookController.orchestrator = PaymentOrchestrator.getInstance();
      await PaymentWebhookController.orchestrator.initialize();
      logger.info('[PaymentWebhookController] Orquestrador inicializado');
    }
  }

  /**
   * Webhook para receber notificações do gateway
   * POST /api/payments/webhook
   */
  static async handleWebhook(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      await PaymentWebhookController.initialize();

      const rawBody = req.body;
      const headers = req.headers;
      const provider = req.query.provider as string || 'stripe';

      logger.info(`[PaymentWebhookController] Webhook recebido do provider: ${provider}`);

      // Log do corpo do webhook (em desenvolvimento)
      if (process.env.NODE_ENV !== 'production') {
        logger.info('[PaymentWebhookController] Webhook body:', JSON.stringify(rawBody, null, 2));
        logger.info('[PaymentWebhookController] Webhook headers:', JSON.stringify(headers, null, 2));
      }

      // Processar webhook via orquestrador
      const webhookData = await PaymentWebhookController.orchestrator.handleWebhook(
        rawBody,
        headers
      );

      logger.info(`[PaymentWebhookController] Webhook processado: ${webhookData.paymentId} - ${webhookData.status}`);

      // Atualizar status do pagamento no sistema
      await PaymentWebhookController.updatePaymentStatus(webhookData);

      res.status(200).json({
        success: true,
        message: 'Webhook processado com sucesso',
        data: webhookData,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('[PaymentWebhookController] Erro ao processar webhook:', error);
      // Sempre retornar 200 para evitar retentativas do provedor
      res.status(200).json({
        success: false,
        message: error instanceof Error ? error.message : 'Erro ao processar webhook',
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Atualizar status do pagamento no sistema
   */
  private static async updatePaymentStatus(data: any): Promise<void> {
    try {
      const { paymentId, status, paidAt, metadata } = data;

      // Buscar pagamento pelo ID do provedor
      const payment = await PaymentService.getPaymentByProviderId(paymentId);

      if (!payment) {
        logger.warn(`[PaymentWebhookController] Pagamento não encontrado: ${paymentId}`);
        return;
      }

      // Atualizar status
      const updateData: any = { status };

      if (status === 'paid' && paidAt) {
        updateData.paidAt = new Date(paidAt);
      }

      if (metadata) {
        updateData.providerWebhookData = metadata;
      }

      await PaymentService.updatePaymentStatus(payment._id.toString(), updateData);

      // Se o pagamento foi confirmado, ativar assinatura
      if (status === 'paid' && payment.subscriptionId) {
        const SubscriptionService = (await import('../services/SubscriptionService.js')).SubscriptionService;
        await SubscriptionService.activateSubscription(payment.subscriptionId.toString());
        logger.info(`[PaymentWebhookController] Assinatura ativada: ${payment.subscriptionId}`);
      }

      logger.info(`[PaymentWebhookController] Status do pagamento ${paymentId} atualizado para ${status}`);
    } catch (error) {
      logger.error('[PaymentWebhookController] Erro ao atualizar status do pagamento:', error);
    }
  }

  /**
   * Health check do webhook
   * GET /api/payments/webhook/health
   */
  static async getHealth(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      await PaymentWebhookController.initialize();

      const status = await PaymentWebhookController.orchestrator.getHealth();

      res.json({
        success: true,
        data: status,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }
}