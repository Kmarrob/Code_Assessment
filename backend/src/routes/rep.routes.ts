// backend/src/routes/rep.routes.ts
import { Router } from 'express';
import { RepController } from '../controllers/RepController.js';
import { DashboardController } from '../controllers/DashboardController.js'; // Importado para a nova rota
import { authenticate, authorize } from '../middleware/auth.js';
import { sanitizeAdminInputs } from '../middleware/sanitizeAdmin.js';
import { adminRateLimiter, authenticatedRateLimiter } from '../middleware/rateLimit.js'; // Garantindo a importação do rate limiter solicitado

const router = Router();

// Todas as rotas exigem autenticação e role REP
router.use(authenticate);
router.use(authorize('rep'));

// ============================================
// ROTAS DO PREPOSTO
// ============================================

// Listar usuários do preposto
router.get(
  '/users',
  adminRateLimiter,
  RepController.listUsers
);

// Criar usuário
router.post(
  '/users',
  adminRateLimiter,
  sanitizeAdminInputs,
  RepController.createUser
);

// Atribuir controles a um usuário
router.post(
  '/assignments',
  adminRateLimiter,
  sanitizeAdminInputs,
  RepController.assignControls
);

// Obter progresso de um usuário específico
router.get(
  '/progress/:userId',
  adminRateLimiter,
  RepController.getUserProgress
);

// Obter progresso geral do preposto
router.get(
  '/progress/overall',
  adminRateLimiter,
  RepController.getOverallProgress
);

// Obter estatísticas do preposto
router.get(
  '/stats',
  adminRateLimiter,
  RepController.getStats
);

// Obter dashboard da empresa
router.get(
  '/dashboard/:companyId',
  authenticatedRateLimiter,
  DashboardController.getRepDashboard
);

// ============================================
// NOVA ROTA: Obter controles da empresa do preposto
// ============================================
router.get(
  '/controls',
  adminRateLimiter,
  RepController.getCompanyControls
);

export default router;