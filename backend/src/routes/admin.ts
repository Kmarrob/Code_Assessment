// backend/src/routes/admin.ts
import { Router } from 'express';
import { AdminController } from '../controllers/AdminController.js';
import { CompanyController } from '../controllers/CompanyController.js';
import { QuestionController } from '../controllers/QuestionController.js';
import { DashboardController } from '../controllers/DashboardController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { 
  authenticatedRateLimiter, 
  sensitiveRateLimiter,
  adminRateLimiter,
} from '../middleware/rateLimit.js';
import { noCache } from '../middleware/cache.js';
import { sanitizeAdminInputs, sanitizeSensitiveFields } from '../middleware/sanitizeAdmin.js';
import { adminPerformanceMiddleware } from '../middleware/adminPerformance.js';
import { ControlController } from '../controllers/ControlController.js';
import { UserRole } from '../types/index.js';

const router = Router();

// ============================================
// MIDDLEWARES - Todas as rotas admin exigem autenticação e role ADMIN
// ============================================
router.use(authenticate);
router.use(authorize(UserRole.ADMIN));
router.use(sanitizeAdminInputs);
router.use(sanitizeSensitiveFields);
router.use(adminPerformanceMiddleware);

// ============================================
// ROTAS DE DASHBOARD
// ============================================

// Dashboard das empresas
router.get(
  '/dashboard/companies',
  authenticatedRateLimiter,
  DashboardController.listCompaniesSummary
);

router.get(
  '/dashboard/companies/:companyId',
  authenticatedRateLimiter,
  DashboardController.getAdminCompanyDashboard
);

// ============================================
// ROTAS CRUD DE USUÁRIOS
// ============================================

// Listar usuários
router.get(
  '/users',
  authenticatedRateLimiter,
  noCache,
  AdminController.listUsers
);

// Buscar usuário por ID
router.get(
  '/users/:id',
  authenticatedRateLimiter,
  noCache,
  AdminController.getUserById
);

// Criar usuário
router.post(
  '/users',
  adminRateLimiter,
  noCache,
  AdminController.createUser
);

// Atualizar usuário
router.put(
  '/users/:id',
  adminRateLimiter,
  noCache,
  AdminController.updateUser
);

// Desativar usuário
router.delete(
  '/users/:id',
  adminRateLimiter,
  noCache,
  AdminController.deleteUser
);

// Reativar usuário
router.post(
  '/users/:id/reactivate',
  adminRateLimiter,
  noCache,
  AdminController.reactivateUser
);

// Resetar senha
router.post(
  '/users/:id/reset-password',
  adminRateLimiter,
  noCache,
  AdminController.resetPassword
);

// ============================================
// ROTAS DE CONTROLES - LEITURA
// ============================================

// Listar controles (com filtros e paginação)
router.get(
  '/controls',
  authenticatedRateLimiter,
  noCache,
  ControlController.listControls
);

// Buscar controle por ID
router.get(
  '/controls/:id',
  authenticatedRateLimiter,
  noCache,
  ControlController.getControlById
);

// Buscar controles por domínio
router.get(
  '/controls/domain/:dominio',
  authenticatedRateLimiter,
  noCache,
  ControlController.getControlsByDomain
);

// Estatísticas dos controles
router.get(
  '/controls/stats',
  authenticatedRateLimiter,
  noCache,
  ControlController.getControlStats
);

// ============================================
// ROTAS DE CONTROLES - ESCRITA (CRUD)
// ============================================

// Criar novo controle
router.post(
  '/controls',
  sensitiveRateLimiter,
  noCache,
  ControlController.createControl
);

// Atualizar controle existente
router.put(
  '/controls/:id',
  sensitiveRateLimiter,
  noCache,
  ControlController.updateControl
);

// Deletar controle
router.delete(
  '/controls/:id',
  sensitiveRateLimiter,
  noCache,
  ControlController.deleteControl
);

// ============================================
// ROTAS DE EMPRESAS (COMPANIES)
// ============================================

// Listar empresas
router.get(
  '/companies',
  authenticatedRateLimiter,
  noCache,
  CompanyController.listCompanies
);

// Buscar empresa por ID
router.get(
  '/companies/:id',
  authenticatedRateLimiter,
  noCache,
  CompanyController.getCompanyById
);

// Criar empresa
router.post(
  '/companies',
  adminRateLimiter,
  noCache,
  CompanyController.createCompany
);

// Atualizar empresa
router.put(
  '/companies/:id',
  adminRateLimiter,
  noCache,
  CompanyController.updateCompany
);

// Desativar empresa
router.delete(
  '/companies/:id',
  adminRateLimiter,
  noCache,
  CompanyController.deactivateCompany
);

// Reativar empresa
router.post(
  '/companies/:id/reactivate',
  adminRateLimiter,
  noCache,
  CompanyController.reactivateCompany
);

// Atribuir todos os controles à empresa
router.post(
  '/companies/:id/assign-all-controls',
  adminRateLimiter,
  noCache,
  CompanyController.assignAllControls
);

// Estatísticas das empresas
router.get(
  '/companies/stats',
  authenticatedRateLimiter,
  noCache,
  CompanyController.getStats
);

// ============================================
// ROTAS DE PERGUNTAS (QUESTIONS)
// ============================================

// Listar perguntas
router.get(
  '/questions',
  authenticatedRateLimiter,
  noCache,
  QuestionController.listQuestions
);

// Buscar perguntas por controle
router.get(
  '/questions/control/:controlId',
  authenticatedRateLimiter,
  noCache,
  QuestionController.getQuestionsByControl
);

// Buscar pergunta por ID
router.get(
  '/questions/:id',
  authenticatedRateLimiter,
  noCache,
  QuestionController.getQuestionById
);

// Criar pergunta
router.post(
  '/questions',
  adminRateLimiter,
  noCache,
  QuestionController.createQuestion
);

// Atualizar pergunta
router.put(
  '/questions/:id',
  adminRateLimiter,
  noCache,
  QuestionController.updateQuestion
);

// Deletar pergunta
router.delete(
  '/questions/:id',
  adminRateLimiter,
  noCache,
  QuestionController.deleteQuestion
);

// Ativar/Desativar pergunta
router.patch(
  '/questions/:id/toggle',
  adminRateLimiter,
  noCache,
  QuestionController.toggleActive
);

export default router;