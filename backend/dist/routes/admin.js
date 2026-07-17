"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// backend/src/routes/admin.ts
const express_1 = require("express");
const AdminController_js_1 = require("../controllers/AdminController.js");
const CompanyController_js_1 = require("../controllers/CompanyController.js");
const QuestionController_js_1 = require("../controllers/QuestionController.js");
const DashboardController_js_1 = require("../controllers/DashboardController.js");
const auth_js_1 = require("../middleware/auth.js");
const rateLimit_js_1 = require("../middleware/rateLimit.js");
const cache_js_1 = require("../middleware/cache.js");
const sanitizeAdmin_js_1 = require("../middleware/sanitizeAdmin.js");
const adminPerformance_js_1 = require("../middleware/adminPerformance.js");
const ControlController_js_1 = require("../controllers/ControlController.js");
const index_js_1 = require("../types/index.js");
// 🔴 NOVO: Import do multer
const multer_js_1 = require("../config/multer.js");
const router = (0, express_1.Router)();
// ============================================
// MIDDLEWARES - Todas as rotas admin exigem autenticação e role ADMIN
// ============================================
router.use(auth_js_1.authenticate);
router.use((0, auth_js_1.authorize)(index_js_1.UserRole.ADMIN));
router.use(sanitizeAdmin_js_1.sanitizeAdminInputs);
router.use(sanitizeAdmin_js_1.sanitizeSensitiveFields);
router.use(adminPerformance_js_1.adminPerformanceMiddleware);
// ============================================
// ROTAS DE DASHBOARD
// ============================================
// Dashboard das empresas
router.get('/dashboard/companies', rateLimit_js_1.adminRateLimiter, // CORREÇÃO: adminRateLimiter em vez de authenticatedRateLimiter
DashboardController_js_1.DashboardController.listCompaniesSummary);
router.get('/dashboard/companies/:companyId', rateLimit_js_1.adminRateLimiter, // CORREÇÃO: adminRateLimiter em vez de authenticatedRateLimiter
DashboardController_js_1.DashboardController.getAdminCompanyDashboard);
// ============================================
// ROTAS CRUD DE USUÁRIOS
// ============================================
// Listar usuários
router.get('/users', rateLimit_js_1.adminRateLimiter, // CORREÇÃO: adminRateLimiter em vez de authenticatedRateLimiter
cache_js_1.noCache, AdminController_js_1.AdminController.listUsers);
// Buscar usuário por ID
router.get('/users/:id', rateLimit_js_1.adminRateLimiter, // CORREÇÃO: adminRateLimiter em vez de authenticatedRateLimiter
cache_js_1.noCache, AdminController_js_1.AdminController.getUserById);
// Criar usuário
router.post('/users', rateLimit_js_1.adminRateLimiter, cache_js_1.noCache, AdminController_js_1.AdminController.createUser);
// Atualizar usuário
router.put('/users/:id', rateLimit_js_1.adminRateLimiter, cache_js_1.noCache, AdminController_js_1.AdminController.updateUser);
// Desativar usuário
router.delete('/users/:id', rateLimit_js_1.adminRateLimiter, cache_js_1.noCache, AdminController_js_1.AdminController.deleteUser);
// Reativar usuário
router.post('/users/:id/reactivate', rateLimit_js_1.adminRateLimiter, cache_js_1.noCache, AdminController_js_1.AdminController.reactivateUser);
// Resetar senha
router.post('/users/:id/reset-password', rateLimit_js_1.adminRateLimiter, cache_js_1.noCache, AdminController_js_1.AdminController.resetPassword);
// ============================================
// ROTAS DE CONTROLES - LEITURA
// ============================================
// Listar controles (com filtros e paginação)
router.get('/controls', rateLimit_js_1.adminRateLimiter, // CORREÇÃO: adminRateLimiter em vez de authenticatedRateLimiter
cache_js_1.noCache, ControlController_js_1.ControlController.listControls);
// Buscar controle por ID
router.get('/controls/:id', rateLimit_js_1.adminRateLimiter, // CORREÇÃO: adminRateLimiter em vez de authenticatedRateLimiter
cache_js_1.noCache, ControlController_js_1.ControlController.getControlById);
// Buscar controles por domínio
router.get('/controls/domain/:dominio', rateLimit_js_1.adminRateLimiter, // CORREÇÃO: adminRateLimiter em vez de authenticatedRateLimiter
cache_js_1.noCache, ControlController_js_1.ControlController.getControlsByDomain);
// Estatísticas dos controles
router.get('/controls/stats', rateLimit_js_1.adminRateLimiter, // CORREÇÃO: adminRateLimiter em vez de authenticatedRateLimiter
cache_js_1.noCache, ControlController_js_1.ControlController.getControlStats);
// ============================================
// ROTAS DE CONTROLES - ESCRITA (CRUD)
// ============================================
// Criar novo controle
router.post('/controls', rateLimit_js_1.adminRateLimiter, // CORREÇÃO: adminRateLimiter em vez de sensitiveRateLimiter
cache_js_1.noCache, ControlController_js_1.ControlController.createControl);
// Atualizar controle existente
router.put('/controls/:id', rateLimit_js_1.adminRateLimiter, // CORREÇÃO: adminRateLimiter em vez de sensitiveRateLimiter
cache_js_1.noCache, ControlController_js_1.ControlController.updateControl);
// Deletar controle
router.delete('/controls/:id', rateLimit_js_1.adminRateLimiter, // CORREÇÃO: adminRateLimiter em vez de sensitiveRateLimiter
cache_js_1.noCache, ControlController_js_1.ControlController.deleteControl);
// ============================================
// ROTAS DE EMPRESAS (COMPANIES)
// ============================================
// Listar empresas
router.get('/companies', rateLimit_js_1.adminRateLimiter, // CORREÇÃO: adminRateLimiter em vez de authenticatedRateLimiter
cache_js_1.noCache, CompanyController_js_1.CompanyController.listCompanies);
// Buscar empresa por ID
router.get('/companies/:id', rateLimit_js_1.adminRateLimiter, // CORREÇÃO: adminRateLimiter em vez de authenticatedRateLimiter
cache_js_1.noCache, CompanyController_js_1.CompanyController.getCompanyById);
// Criar empresa
router.post('/companies', rateLimit_js_1.adminRateLimiter, cache_js_1.noCache, CompanyController_js_1.CompanyController.createCompany);
// Atualizar empresa
router.put('/companies/:id', rateLimit_js_1.adminRateLimiter, cache_js_1.noCache, CompanyController_js_1.CompanyController.updateCompany);
// Desativar empresa
router.delete('/companies/:id', rateLimit_js_1.adminRateLimiter, cache_js_1.noCache, CompanyController_js_1.CompanyController.deactivateCompany);
// Reativar empresa
router.post('/companies/:id/reactivate', rateLimit_js_1.adminRateLimiter, cache_js_1.noCache, CompanyController_js_1.CompanyController.reactivateCompany);
// Atribuir todos os controles à empresa
router.post('/companies/:id/assign-all-controls', rateLimit_js_1.adminRateLimiter, cache_js_1.noCache, CompanyController_js_1.CompanyController.assignAllControls);
// Estatísticas das empresas
router.get('/companies/stats', rateLimit_js_1.adminRateLimiter, // CORREÇÃO: adminRateLimiter em vez de authenticatedRateLimiter
cache_js_1.noCache, CompanyController_js_1.CompanyController.getStats);
// ============================================
// ROTAS DE PERGUNTAS (QUESTIONS)
// ============================================
// Listar perguntas
router.get('/questions', rateLimit_js_1.adminRateLimiter, // CORREÇÃO: adminRateLimiter em vez de authenticatedRateLimiter
cache_js_1.noCache, QuestionController_js_1.QuestionController.listQuestions);
// Buscar perguntas por controle
router.get('/questions/control/:controlId', rateLimit_js_1.adminRateLimiter, // CORREÇÃO: adminRateLimiter em vez de authenticatedRateLimiter
cache_js_1.noCache, QuestionController_js_1.QuestionController.getQuestionsByControl);
// Buscar pergunta por ID
router.get('/questions/:id', rateLimit_js_1.adminRateLimiter, // CORREÇÃO: adminRateLimiter em vez de authenticatedRateLimiter
cache_js_1.noCache, QuestionController_js_1.QuestionController.getQuestionById);
// Criar pergunta
router.post('/questions', rateLimit_js_1.adminRateLimiter, cache_js_1.noCache, QuestionController_js_1.QuestionController.createQuestion);
// Atualizar pergunta
router.put('/questions/:id', rateLimit_js_1.adminRateLimiter, cache_js_1.noCache, QuestionController_js_1.QuestionController.updateQuestion);
// Deletar pergunta
router.delete('/questions/:id', rateLimit_js_1.adminRateLimiter, cache_js_1.noCache, QuestionController_js_1.QuestionController.deleteQuestion);
// Ativar/Desativar pergunta
router.patch('/questions/:id/toggle', rateLimit_js_1.adminRateLimiter, cache_js_1.noCache, QuestionController_js_1.QuestionController.toggleActive);
// ============================================
// ROTAS DE BRANDING - LOGO E FAVICON
// ============================================
// 🔴 CORRIGIDO: Upload da logo com multer
router.post('/company/:companyId/branding/logo', rateLimit_js_1.adminRateLimiter, cache_js_1.noCache, multer_js_1.uploadLogo.single('logo'), multer_js_1.handleMulterError, AdminController_js_1.AdminController.uploadLogo);
// 🔴 CORRIGIDO: Upload do favicon com multer
router.post('/company/:companyId/branding/favicon', rateLimit_js_1.adminRateLimiter, cache_js_1.noCache, multer_js_1.uploadFavicon.single('favicon'), multer_js_1.handleMulterError, AdminController_js_1.AdminController.uploadFavicon);
// Obter branding da empresa
router.get('/company/:companyId/branding', rateLimit_js_1.adminRateLimiter, cache_js_1.noCache, AdminController_js_1.AdminController.getBranding);
// Remover logo
router.delete('/company/:companyId/branding/logo', rateLimit_js_1.adminRateLimiter, cache_js_1.noCache, AdminController_js_1.AdminController.removeLogo);
// Remover favicon
router.delete('/company/:companyId/branding/favicon', rateLimit_js_1.adminRateLimiter, cache_js_1.noCache, AdminController_js_1.AdminController.removeFavicon);
// Atualizar configurações de branding
router.put('/company/:companyId/branding/settings', rateLimit_js_1.adminRateLimiter, cache_js_1.noCache, AdminController_js_1.AdminController.updateBrandingSettings);
exports.default = router;
//# sourceMappingURL=admin.js.map