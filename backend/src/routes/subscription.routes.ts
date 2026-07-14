// backend/src/routes/subscription.routes.ts
import { Router } from 'express';
import { SubscriptionController } from '../controllers/SubscriptionController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { adminRateLimiter, authenticatedRateLimiter } from '../middleware/rateLimit.js';
import { UserRole } from '../types/index.js';

const router = Router();

// ============================================
// ROTAS DE ASSINATURA
// ============================================

// Todas as rotas exigem autenticação
router.use(authenticate);

// ============================================
// ROTAS PARA REP (self-service)
// ============================================

// Criar assinatura
router.post(
  '/',
  authorize(UserRole.REP, UserRole.ADMIN),
  authenticatedRateLimiter,
  SubscriptionController.createSubscription
);

// Obter assinatura ativa da empresa
router.get(
  '/active',
  authorize(UserRole.REP, UserRole.ADMIN),
  authenticatedRateLimiter,
  SubscriptionController.getActiveSubscription
);

// Obter histórico de assinaturas
router.get(
  '/history',
  authorize(UserRole.REP, UserRole.ADMIN),
  authenticatedRateLimiter,
  SubscriptionController.getSubscriptionHistory
);

// Verificar status da assinatura
router.get(
  '/status',
  authorize(UserRole.REP, UserRole.ADMIN),
  authenticatedRateLimiter,
  SubscriptionController.checkStatus
);

// Cancelar assinatura
router.post(
  '/:id/cancel',
  authorize(UserRole.REP, UserRole.ADMIN),
  authenticatedRateLimiter,
  SubscriptionController.cancelSubscription
);

// ============================================
// ROTAS ADMIN
// ============================================

// Atualizar assinatura (admin)
router.put(
  '/:id',
  authorize(UserRole.ADMIN),
  adminRateLimiter,
  SubscriptionController.updateSubscription
);

// Métricas de assinaturas (admin)
router.get(
  '/admin/metrics',
  authorize(UserRole.ADMIN),
  adminRateLimiter,
  SubscriptionController.getMetrics
);

export default router;