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

// ============================================
// 🆕 NOVAS ROTAS PARA PROGRESSO (ADICIONADAS - NADA FOI EXCLUÍDO)
// ============================================

/**
 * Salvar progresso parcial de um controle (em andamento)
 * POST /api/user/progress
 */
router.post(
  '/progress',
  authenticatedRateLimiter,
  UserController.saveProgress
);

/**
 * Buscar atividades em andamento/interrompidas do usuário
 * GET /api/user/progress/in-progress
 */
router.get(
  '/progress/in-progress',
  authenticatedRateLimiter,
  UserController.getInProgressActivities
);

/**
 * Verificar se o usuário tem atividades pendentes
 * GET /api/user/progress/has-pending
 */
router.get(
  '/progress/has-pending',
  authenticatedRateLimiter,
  UserController.hasPendingActivity
);

/**
 * Buscar progresso de uma atribuição específica
 * GET /api/user/progress/assignment/:assignmentId
 */
router.get(
  '/progress/assignment/:assignmentId',
  authenticatedRateLimiter,
  UserController.getProgressByAssignment
);

/**
 * Limpar progresso de uma atividade
 * DELETE /api/user/progress/assignment/:assignmentId
 */
router.delete(
  '/progress/assignment/:assignmentId',
  authenticatedRateLimiter,
  UserController.clearProgress
);

export default router;