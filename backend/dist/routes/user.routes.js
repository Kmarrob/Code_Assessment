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
exports.default = router;
//# sourceMappingURL=user.routes.js.map