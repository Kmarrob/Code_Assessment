// backend/src/jobs/PaymentJobs.ts

import { PaymentService } from '../services/PaymentService.js';
import { PaymentOrchestrator } from '../services/PaymentOrchestrator.js';
import { SubscriptionService } from '../services/SubscriptionService.js';
import { logger } from '../utils/logger.js';
import { paymentConfig } from '../config/payment.js';

export class PaymentJobs {
  private static orchestrator: PaymentOrchestrator;

  /**
   * Inicializar o orquestrador
   */
  static async initialize(): Promise<void> {
    if (!PaymentJobs.orchestrator) {
      PaymentJobs.orchestrator = PaymentOrchestrator.getInstance();
      await PaymentJobs.orchestrator.initialize();
    }
  }

  /**
   * Verificar pagamentos pendentes
   * Deve ser executado a cada 6 horas
   */
  static async checkPendingPayments(): Promise<{
    processed: number;
    expired: number;
    errors: number;
  }> {
    await PaymentJobs.initialize();

    const result = { processed: 0, expired: 0, errors: 0 };

    try {
      // Buscar pagamentos pendentes com data de vencimento passada
      const pendingPayments = await PaymentService.getPendingPayments();

      logger.info(`[PaymentJobs] Verificando ${pendingPayments.length} pagamentos pendentes`);

      for (const payment of pendingPayments) {
        try {
          // Verificar se o pagamento expirou
          if (payment.dueDate && new Date(payment.dueDate) < new Date()) {
            await PaymentService.updatePaymentStatus(payment._id.toString(), {
              status: 'expired',
            });
            result.expired++;
            logger.info(`[PaymentJobs] Pagamento expirado: ${payment._id}`);
            continue;
          }

          // Se o gateway estiver ativo, tentar verificar o status
          if (paymentConfig.enabled && payment.providerPaymentId) {
            try {
              const response = await PaymentJobs.orchestrator.confirmPayment({
                paymentId: payment.providerPaymentId,
              });

              if (response.success && response.status === 'paid') {
                await PaymentService.updatePaymentStatus(payment._id.toString(), {
                  status: 'paid',
                  paidAt: new Date().toISOString(),
                });

                // Ativar assinatura se houver
                if (payment.subscriptionId) {
                  await SubscriptionService.activateSubscription(
                    payment.subscriptionId.toString()
                  );
                }

                result.processed++;
                logger.info(`[PaymentJobs] Pagamento confirmado: ${payment._id}`);
              }
            } catch (error) {
              logger.error(`[PaymentJobs] Erro ao verificar pagamento ${payment._id}:`, error);
              result.errors++;
            }
          }
        } catch (error) {
          logger.error(`[PaymentJobs] Erro ao processar pagamento ${payment._id}:`, error);
          result.errors++;
        }
      }

      logger.info(`[PaymentJobs] Concluído: ${result.processed} processados, ${result.expired} expirados, ${result.errors} erros`);

      return result;
    } catch (error) {
      logger.error('[PaymentJobs] Erro ao verificar pagamentos pendentes:', error);
      throw error;
    }
  }

  /**
   * Processar pagamentos recorrentes (renovações)
   * Deve ser executado diariamente
   */
  static async processRecurringPayments(): Promise<{
    processed: number;
    failed: number;
    errors: number;
  }> {
    await PaymentJobs.initialize();

    const result = { processed: 0, failed: 0, errors: 0 };

    try {
      // Buscar assinaturas ativas que vão expirar em até 7 dias
      const expiringSoon = await SubscriptionService.getSubscriptionsExpiringSoon(7);

      logger.info(`[PaymentJobs] Verificando ${expiringSoon.length} assinaturas para renovação`);

      for (const subscription of expiringSoon) {
        try {
          if (!subscription.autoRenew) continue;

          // Criar pagamento de renovação
          const payment = await PaymentService.createPayment({
            subscriptionId: subscription._id.toString(),
            amount: subscription.amount,
            currency: subscription.currency || 'BRL',
            description: `Renovação de assinatura - ${subscription.planName}`,
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            billingPeriod: {
              start: new Date().toISOString(),
              end: subscription.endDate.toISOString(),
            },
            items: [
              {
                description: `Plano ${subscription.planName}`,
                quantity: 1,
                unitPrice: subscription.amount,
                totalPrice: subscription.amount,
                type: 'subscription',
              },
            ],
          });

          // Se o gateway estiver ativo, tentar processar automaticamente
          if (paymentConfig.enabled) {
            // TODO: Implementar cobrança automática via gateway
            // Por enquanto, apenas registra
            logger.info(`[PaymentJobs] Pagamento de renovação criado: ${payment._id}`);
          }

          result.processed++;
        } catch (error) {
          logger.error(`[PaymentJobs] Erro ao processar renovação ${subscription._id}:`, error);
          result.errors++;
        }
      }

      return result;
    } catch (error) {
      logger.error('[PaymentJobs] Erro ao processar renovações:', error);
      throw error;
    }
  }

  /**
   * Job para processar webhooks pendentes
   * Deve ser executado a cada hora
   */
  static async processPendingWebhooks(): Promise<{
    processed: number;
    errors: number;
  }> {
    const result = { processed: 0, errors: 0 };

    try {
      // Buscar webhooks pendentes (se implementado)
      // Por enquanto, apenas log
      logger.info('[PaymentJobs] Processando webhooks pendentes...');

      // TODO: Implementar fila de webhooks
      // Por enquanto, apenas retorna
      return result;
    } catch (error) {
      logger.error('[PaymentJobs] Erro ao processar webhooks pendentes:', error);
      throw error;
    }
  }
}