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
// 🔴 NOVO: Import do multer
import { uploadLogo, uploadFavicon, handleMulterError } from '../config/multer.js';

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
  adminRateLimiter, // CORREÇÃO: adminRateLimiter em vez de authenticatedRateLimiter
  DashboardController.listCompaniesSummary
);

router.get(
  '/dashboard/companies/:companyId',
  adminRateLimiter, // CORREÇÃO: adminRateLimiter em vez de authenticatedRateLimiter
  DashboardController.getAdminCompanyDashboard
);

// ============================================
// ROTAS CRUD DE USUÁRIOS
// ============================================

// Listar usuários
router.get(
  '/users',
  adminRateLimiter, // CORREÇÃO: adminRateLimiter em vez de authenticatedRateLimiter
  noCache,
  AdminController.listUsers
);

// Buscar usuário por ID
router.get(
  '/users/:id',
  adminRateLimiter, // CORREÇÃO: adminRateLimiter em vez de authenticatedRateLimiter
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
  adminRateLimiter, // CORREÇÃO: adminRateLimiter em vez de authenticatedRateLimiter
  noCache,
  ControlController.listControls
);

// Buscar controle por ID
router.get(
  '/controls/:id',
  adminRateLimiter, // CORREÇÃO: adminRateLimiter em vez de authenticatedRateLimiter
  noCache,
  ControlController.getControlById
);

// Buscar controles por domínio
router.get(
  '/controls/domain/:dominio',
  adminRateLimiter, // CORREÇÃO: adminRateLimiter em vez de authenticatedRateLimiter
  noCache,
  ControlController.getControlsByDomain
);

// Estatísticas dos controles
router.get(
  '/controls/stats',
  adminRateLimiter, // CORREÇÃO: adminRateLimiter em vez de authenticatedRateLimiter
  noCache,
  ControlController.getControlStats
);

// ============================================
// ROTAS DE CONTROLES - ESCRITA (CRUD)
// ============================================

// Criar novo controle
router.post(
  '/controls',
  adminRateLimiter, // CORREÇÃO: adminRateLimiter em vez de sensitiveRateLimiter
  noCache,
  ControlController.createControl
);

// Atualizar controle existente
router.put(
  '/controls/:id',
  adminRateLimiter, // CORREÇÃO: adminRateLimiter em vez de sensitiveRateLimiter
  noCache,
  ControlController.updateControl
);

// Deletar controle
router.delete(
  '/controls/:id',
  adminRateLimiter, // CORREÇÃO: adminRateLimiter em vez de sensitiveRateLimiter
  noCache,
  ControlController.deleteControl
);

// ============================================
// ROTAS DE EMPRESAS (COMPANIES)
// ============================================

// Listar empresas
router.get(
  '/companies',
  adminRateLimiter, // CORREÇÃO: adminRateLimiter em vez de authenticatedRateLimiter
  noCache,
  CompanyController.listCompanies
);

// Buscar empresa por ID
router.get(
  '/companies/:id',
  adminRateLimiter, // CORREÇÃO: adminRateLimiter em vez de authenticatedRateLimiter
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
  adminRateLimiter, // CORREÇÃO: adminRateLimiter em vez de authenticatedRateLimiter
  noCache,
  CompanyController.getStats
);

// ============================================
// ROTAS DE PERGUNTAS (QUESTIONS)
// ============================================

// Listar perguntas
router.get(
  '/questions',
  adminRateLimiter, // CORREÇÃO: adminRateLimiter em vez de authenticatedRateLimiter
  noCache,
  QuestionController.listQuestions
);

// Buscar perguntas por controle
router.get(
  '/questions/control/:controlId',
  adminRateLimiter, // CORREÇÃO: adminRateLimiter em vez de authenticatedRateLimiter
  noCache,
  QuestionController.getQuestionsByControl
);

// Buscar pergunta por ID
router.get(
  '/questions/:id',
  adminRateLimiter, // CORREÇÃO: adminRateLimiter em vez de authenticatedRateLimiter
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

// ============================================
// ROTAS DE BRANDING - LOGO E FAVICON
// ============================================

// 🔴 CORRIGIDO: Upload da logo com multer
router.post(
  '/company/:companyId/branding/logo',
  adminRateLimiter,
  noCache,
  uploadLogo.single('logo'),
  handleMulterError,
  AdminController.uploadLogo
);

// 🔴 CORRIGIDO: Upload do favicon com multer
router.post(
  '/company/:companyId/branding/favicon',
  adminRateLimiter,
  noCache,
  uploadFavicon.single('favicon'),
  handleMulterError,
  AdminController.uploadFavicon
);

// Obter branding da empresa
router.get(
  '/company/:companyId/branding',
  adminRateLimiter,
  noCache,
  AdminController.getBranding
);

// Remover logo
router.delete(
  '/company/:companyId/branding/logo',
  adminRateLimiter,
  noCache,
  AdminController.removeLogo
);

// Remover favicon
router.delete(
  '/company/:companyId/branding/favicon',
  adminRateLimiter,
  noCache,
  AdminController.removeFavicon
);

// Atualizar configurações de branding
router.put(
  '/company/:companyId/branding/settings',
  adminRateLimiter,
  noCache,
  AdminController.updateBrandingSettings
);

// ============================================
// 🔴 NOVO: ROTAS DE BRANDING PARA PREPOSTO (REP)
// ============================================

// 🔴 NOVO: Upload da logo para REP (rota separada com autorização mista)
router.post(
  '/rep/company/:companyId/branding/logo',
  authenticatedRateLimiter,
  noCache,
  uploadLogo.single('logo'),
  handleMulterError,
  AdminController.uploadLogo
);

// 🔴 NOVO: Remover logo para REP
router.delete(
  '/rep/company/:companyId/branding/logo',
  authenticatedRateLimiter,
  noCache,
  AdminController.removeLogo
);

// 🔴 NOVO: Obter branding para REP
router.get(
  '/rep/company/:companyId/branding',
  authenticatedRateLimiter,
  noCache,
  AdminController.getBranding
);

export default router;