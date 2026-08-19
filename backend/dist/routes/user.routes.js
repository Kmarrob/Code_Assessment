"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// backend/src/routes/user.routes.ts
const express_1 = require("express");
const UserController_js_1 = require("../controllers/UserController.js");
const auth_js_1 = require("../middleware/auth.js");
const rateLimit_js_1 = require("../middleware/rateLimit.js");
const router = (0, express_1.Router)();
// Todas as rotas exigem autenticação
router.use(auth_js_1.authenticate);
// ============================================
// ROTAS DO USUÁRIO
// ============================================
// Obter controles do usuário
router.get('/controls', rateLimit_js_1.authenticatedRateLimiter, UserController_js_1.UserController.getControls);
// Obter estatísticas do usuário
router.get('/stats', rateLimit_js_1.authenticatedRateLimiter, UserController_js_1.UserController.getStats);
// Obter progresso do usuário
router.get('/progress', rateLimit_js_1.authenticatedRateLimiter, UserController_js_1.UserController.getProgress);
// Salvar resposta de um controle
router.post('/responses', rateLimit_js_1.authenticatedRateLimiter, UserController_js_1.UserController.saveResponse);
// ============================================
// NOVA ROTA: OBTER PERGUNTAS POR CONTROLE
// ============================================
router.get('/questions/control/:controlId', rateLimit_js_1.authenticatedRateLimiter, UserController_js_1.UserController.getQuestionsByControl);
// ============================================
// 🆕 NOVAS ROTAS PARA PROGRESSO (ADICIONADAS - NADA FOI EXCLUÍDO)
// ============================================
/**
 * Salvar progresso parcial de um controle (em andamento)
 * POST /api/user/progress
 */
router.post('/progress', rateLimit_js_1.authenticatedRateLimiter, UserController_js_1.UserController.saveProgress);
/**
 * Buscar atividades em andamento/interrompidas do usuário
 * GET /api/user/progress/in-progress
 */
router.get('/progress/in-progress', rateLimit_js_1.authenticatedRateLimiter, UserController_js_1.UserController.getInProgressActivities);
/**
 * Verificar se o usuário tem atividades pendentes
 * GET /api/user/progress/has-pending
 */
router.get('/progress/has-pending', rateLimit_js_1.authenticatedRateLimiter, UserController_js_1.UserController.hasPendingActivity);
/**
 * Buscar progresso de uma atribuição específica
 * GET /api/user/progress/assignment/:assignmentId
 */
router.get('/progress/assignment/:assignmentId', rateLimit_js_1.authenticatedRateLimiter, UserController_js_1.UserController.getProgressByAssignment);
/**
 * Limpar progresso de uma atividade
 * DELETE /api/user/progress/assignment/:assignmentId
 */
router.delete('/progress/assignment/:assignmentId', rateLimit_js_1.authenticatedRateLimiter, UserController_js_1.UserController.clearProgress);
exports.default = router;
//# sourceMappingURL=user.routes.js.map