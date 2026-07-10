"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const RepController_js_1 = require("../controllers/RepController.js");
const DashboardController_js_1 = require("../controllers/DashboardController.js");
const auth_js_1 = require("../middleware/auth.js");
const sanitizeAdmin_js_1 = require("../middleware/sanitizeAdmin.js");
const rateLimit_js_1 = require("../middleware/rateLimit.js");
const index_js_1 = require("../types/index.js");
const router = (0, express_1.Router)();
// Todas as rotas exigem autenticação e role REP
router.use(auth_js_1.authenticate);
router.use((0, auth_js_1.authorize)(index_js_1.UserRole.REP));
// ============================================
// ROTAS DO PREPOSTO
// ============================================
// Listar usuários do preposto
router.get('/users', rateLimit_js_1.adminRateLimiter, RepController_js_1.RepController.listUsers);
// 🔴 NOVA ROTA ESTÁTICA: Movida para cima para evitar conflito com parâmetros dinâmicos
router.get('/users-with-responses', rateLimit_js_1.adminRateLimiter, RepController_js_1.RepController.getUsersWithResponses);
// Criar usuário
router.post('/users', rateLimit_js_1.adminRateLimiter, sanitizeAdmin_js_1.sanitizeAdminInputs, RepController_js_1.RepController.createUser);
// 🔴 NOVO: Editar usuário
router.put('/users/:userId', rateLimit_js_1.adminRateLimiter, sanitizeAdmin_js_1.sanitizeAdminInputs, RepController_js_1.RepController.updateUser);
// 🔴 NOVO: Inativar usuário
router.delete('/users/:userId', rateLimit_js_1.adminRateLimiter, sanitizeAdmin_js_1.sanitizeAdminInputs, RepController_js_1.RepController.inactivateUser);
// Atribuir controles a um usuário
router.post('/assignments', rateLimit_js_1.adminRateLimiter, sanitizeAdmin_js_1.sanitizeAdminInputs, RepController_js_1.RepController.assignControls);
// 🔴 NOVO: Revogar controle com reatribuição
router.post('/assignments/:assignmentId/revoke', rateLimit_js_1.adminRateLimiter, sanitizeAdmin_js_1.sanitizeAdminInputs, RepController_js_1.RepController.revokeControl);
// 🔴 CORREÇÃO CRÍTICA DE ORDEM: 'progress/overall' DEVE vir antes de 'progress/:userId'
router.get('/progress/overall', rateLimit_js_1.adminRateLimiter, RepController_js_1.RepController.getOverallProgress);
// Obter progresso de um usuário específico
router.get('/progress/:userId', rateLimit_js_1.adminRateLimiter, RepController_js_1.RepController.getUserProgress);
// Obter estatísticas do preposto
router.get('/stats', rateLimit_js_1.adminRateLimiter, RepController_js_1.RepController.getStats);
// Obter dashboard da empresa
router.get('/dashboard/:companyId', rateLimit_js_1.authenticatedRateLimiter, DashboardController_js_1.DashboardController.getRepDashboard);
// ============================================
// ROTA: Obter controles da empresa do preposto
// ============================================
router.get('/controls', rateLimit_js_1.adminRateLimiter, RepController_js_1.RepController.getCompanyControls);
exports.default = router;
//# sourceMappingURL=rep.routes.js.map