import { Router } from 'express';
import { RepController } from '../controllers/RepController.js';
import { DashboardController } from '../controllers/DashboardController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { sanitizeAdminInputs } from '../middleware/sanitizeAdmin.js';
import { adminRateLimiter, authenticatedRateLimiter } from '../middleware/rateLimit.js';
import { UserRole } from '../types/index.js';

const router = Router();

// Todas as rotas exigem autenticação e role REP
router.use(authenticate);
router.use(authorize(UserRole.REP));

// ============================================
// ROTAS DO PREPOSTO
// ============================================

// Listar usuários do preposto
router.get(
  '/users',
  adminRateLimiter,
  RepController.listUsers
);

// 🔴 NOVA ROTA ESTÁTICA: Movida para cima para evitar conflito com parâmetros dinâmicos
router.get(
  '/users-with-responses',
  adminRateLimiter,
  RepController.getUsersWithResponses
);

// Criar usuário
router.post(
  '/users',
  adminRateLimiter,
  sanitizeAdminInputs,
  RepController.createUser
);

// 🔴 NOVO: Editar usuário
router.put(
  '/users/:userId',
  adminRateLimiter,
  sanitizeAdminInputs,
  RepController.updateUser
);

// 🔴 NOVO: Inativar usuário
router.delete(
  '/users/:userId',
  adminRateLimiter,
  sanitizeAdminInputs,
  RepController.inactivateUser
);

// Atribuir controles a um usuário
router.post(
  '/assignments',
  adminRateLimiter,
  sanitizeAdminInputs,
  RepController.assignControls
);

// 🔴 NOVO: Revogar controle com reatribuição
router.post(
  '/assignments/:assignmentId/revoke',
  adminRateLimiter,
  sanitizeAdminInputs,
  RepController.revokeControl
);

// 🔴 CORREÇÃO CRÍTICA DE ORDEM: 'progress/overall' DEVE vir antes de 'progress/:userId'
router.get(
  '/progress/overall',
  adminRateLimiter,
  RepController.getOverallProgress
);

// Obter progresso de um usuário específico
router.get(
  '/progress/:userId',
  adminRateLimiter,
  RepController.getUserProgress
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
// ROTA: Obter controles da empresa do preposto
// ============================================
router.get(
  '/controls',
  adminRateLimiter,
  RepController.getCompanyControls
);

export default router;