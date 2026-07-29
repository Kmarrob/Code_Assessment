// backend/src/routes/rep.routes.ts
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

// 🔴 NOVO: Gerar PDF do dashboard da empresa
router.get(
  '/dashboard/:companyId/pdf',
  authenticatedRateLimiter,
  DashboardController.generateDashboardPDF
);

// ============================================
// 🔴 NOVAS ROTAS PARA PDFS ESPECÍFICOS POR SEÇÃO
// ============================================

/**
 * 🔴 NOVO: Gerar PDF apenas da seção de Categorização
 * GET /api/rep/dashboard/:companyId/pdf/categorization
 */
router.get(
  '/dashboard/:companyId/pdf/categorization',
  authenticatedRateLimiter,
  DashboardController.generateCategorizationPDF
);

/**
 * 🔴 NOVO: Gerar PDF apenas da seção de Tipos de Controle
 * GET /api/rep/dashboard/:companyId/pdf/control-types
 */
router.get(
  '/dashboard/:companyId/pdf/control-types',
  authenticatedRateLimiter,
  DashboardController.generateControlTypesPDF
);

/**
 * 🔴 NOVO: Gerar PDF apenas da seção de Conceitos Cibernéticos
 * GET /api/rep/dashboard/:companyId/pdf/cyber-concepts
 */
router.get(
  '/dashboard/:companyId/pdf/cyber-concepts',
  authenticatedRateLimiter,
  DashboardController.generateCyberConceptsPDF
);

/**
 * 🔴 NOVO: Gerar PDF apenas da seção de Capacidades Operacionais
 * GET /api/rep/dashboard/:companyId/pdf/capabilities
 */
router.get(
  '/dashboard/:companyId/pdf/capabilities',
  authenticatedRateLimiter,
  DashboardController.generateCapabilitiesPDF
);

/**
 * 🔴 NOVO: Gerar PDF apenas da seção de Domínios
 * GET /api/rep/dashboard/:companyId/pdf/domains
 */
router.get(
  '/dashboard/:companyId/pdf/domains',
  authenticatedRateLimiter,
  DashboardController.generateDomainsPDF
);

// ============================================
// ROTA: Obter controles da empresa do preposto
// ============================================
router.get(
  '/controls',
  adminRateLimiter,
  RepController.getCompanyControls
);

// ============================================
// 🔴 NOVAS ROTAS PARA ATRIBUIÇÃO PARA SI MESMO
// ============================================

/**
 * 🔴 NOVO: Buscar controles já atribuídos ao preposto
 * GET /api/rep/my-assignments
 */
router.get(
  '/my-assignments',
  adminRateLimiter,
  RepController.getMyAssignments
);

/**
 * 🔴 NOVO: Atribuir controles para o próprio preposto
 * POST /api/rep/assign-to-self
 */
router.post(
  '/assign-to-self',
  adminRateLimiter,
  sanitizeAdminInputs,
  RepController.assignToSelf
);

export default router;