// backend/src/routes/branding.routes.ts
import { Router } from 'express';
import { AdminController } from '../controllers/AdminController.js';
import { authenticate } from '../middleware/auth.js';
import { authenticatedRateLimiter } from '../middleware/rateLimit.js';
import { noCache } from '../middleware/cache.js';

const router = Router();

// ============================================
// ROTAS DE BRANDING (acessível para ADMIN e REP da própria empresa)
// ============================================

// Todas as rotas exigem autenticação
router.use(authenticate);
router.use(authenticatedRateLimiter);

// Obter branding da empresa (ADMIN ou REP da própria empresa)
router.get(
  '/company/:companyId/branding',
  noCache,
  AdminController.getBranding
);

export default router;