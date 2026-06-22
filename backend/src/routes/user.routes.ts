// backend/src/routes/user.routes.ts
import { Router } from 'express';
import { UserController } from '../controllers/UserController.js';
import { authenticate } from '../middleware/auth.js';
import { authenticatedRateLimiter } from '../middleware/rateLimit.js';

const router = Router();

// Todas as rotas exigem autenticação
router.use(authenticate);

// ============================================
// ROTAS DO USUÁRIO
// ============================================

// Obter controles do usuário
router.get(
  '/controls',
  authenticatedRateLimiter,
  UserController.getControls
);

// Obter estatísticas do usuário
router.get(
  '/stats',
  authenticatedRateLimiter,
  UserController.getStats
);

// Obter progresso do usuário
router.get(
  '/progress',
  authenticatedRateLimiter,
  UserController.getProgress
);

// Salvar resposta de um controle
router.post(
  '/responses',
  authenticatedRateLimiter,
  UserController.saveResponse
);

// ============================================
// NOVA ROTA: OBTER PERGUNTAS POR CONTROLE
// ============================================
router.get(
  '/questions/control/:controlId',
  authenticatedRateLimiter,
  UserController.getQuestionsByControl
);

export default router;