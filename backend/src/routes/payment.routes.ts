// backend/src/routes/payment.routes.ts
import { Router } from 'express';
import { PaymentController } from '../controllers/PaymentController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { adminRateLimiter, authenticatedRateLimiter } from '../middleware/rateLimit.js';
import { UserRole } from '../types/index.js';

const router = Router();

// ============================================
// ROTAS PÚBLICAS (webhook)
// ============================================

// Webhook para confirmar pagamento (provedor)
router.post(
  '/webhook',
  authenticatedRateLimiter,
  PaymentController.webhook
);

// ============================================
// ROTAS PROTEGIDAS
// ============================================

// Todas as rotas abaixo exigem autenticação
router.use(authenticate);

// ============================================
// ROTAS PARA REP (self-service)
// ============================================

// Criar pagamento
router.post(
  '/',
  authorize(UserRole.REP, UserRole.ADMIN),
  authenticatedRateLimiter,
  PaymentController.createPayment
);

// Listar pagamentos da empresa
router.get(
  '/',
  authorize(UserRole.REP, UserRole.ADMIN),
  authenticatedRateLimiter,
  PaymentController.listPayments
);

// Obter pagamento por ID
router.get(
  '/:id',
  authorize(UserRole.REP, UserRole.ADMIN),
  authenticatedRateLimiter,
  PaymentController.getPaymentById
);

// Gerar fatura para assinatura
router.post(
  '/subscriptions/:subscriptionId/invoice',
  authorize(UserRole.REP, UserRole.ADMIN),
  authenticatedRateLimiter,
  PaymentController.generateInvoice
);

// ============================================
// ROTAS ADMIN
// ============================================

// Listar todos os pagamentos (admin)
router.get(
  '/admin/payments',
  authorize(UserRole.ADMIN),
  adminRateLimiter,
  PaymentController.listAllPayments
);

// Métricas de pagamento (admin)
router.get(
  '/admin/payments/metrics',
  authorize(UserRole.ADMIN),
  adminRateLimiter,
  PaymentController.getMetrics
);

// Confirmar pagamento manualmente (admin)
router.post(
  '/admin/payments/:id/confirm',
  authorize(UserRole.ADMIN),
  adminRateLimiter,
  PaymentController.confirmPaymentManually
);

// Estornar pagamento (admin)
router.post(
  '/admin/payments/:id/refund',
  authorize(UserRole.ADMIN),
  adminRateLimiter,
  PaymentController.refundPayment
);

export default router;